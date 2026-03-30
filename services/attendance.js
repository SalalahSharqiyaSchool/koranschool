import { readFile, writeFile, attendancePath } from './githubApi'

// جلب سجل الغياب لمجموعة وشعبة
export async function getAttendance(group, section) {
  const result = await readFile(attendancePath(group, section))
  return result ? result : { data: [], sha: null }
}

// حفظ سجل الغياب (كل المجموعة في نفس الوقت)
export async function saveAttendance(group, section, records, sha = null) {
  return await writeFile(
    attendancePath(group, section),
    records,
    sha,
    `تحديث غياب ${group} - ${section}`
  )
}

// تسجيل غياب يوم معين
export async function recordDayAttendance(group, section, date, absentIds, teacher) {
  const { data: records, sha } = await getAttendance(group, section)
  // إزالة سجل اليوم إن وجد ثم إضافة الجديد
  const filtered = records.filter(r => r.date !== date)
  if (absentIds.length > 0) {
    filtered.push({
      date,
      absentStudentIds: absentIds,
      recordedBy: teacher,
      recordedAt: new Date().toISOString(),
    })
  }
  // ترتيب حسب التاريخ
  filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
  return await saveAttendance(group, section, filtered, sha)
}

// جلب غياب طالب محدد
export function getStudentAbsence(records, studentId) {
  return records.filter(r => r.absentStudentIds.includes(studentId))
}

// جلب غياب يوم محدد
export function getDayAbsence(records, date) {
  return records.find(r => r.date === date) || null
}

// جلب غياب في فترة زمنية
export function getAbsenceInRange(records, fromDate, toDate) {
  return records.filter(r => r.date >= fromDate && r.date <= toDate)
}

// حذف سجل يوم معين
export async function deleteDayAttendance(group, section, date) {
  const { data: records, sha } = await getAttendance(group, section)
  const filtered = records.filter(r => r.date !== date)
  return await saveAttendance(group, section, filtered, sha)
}

// تعديل غياب يوم معين
export async function editDayAttendance(group, section, date, newAbsentIds, teacher) {
  return await recordDayAttendance(group, section, date, newAbsentIds, teacher)
}
