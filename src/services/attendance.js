import { readFile, writeFile, attendancePath } from './githubApi'

export async function getAttendance(group, section) {
  const result = await readFile(attendancePath(group, section))
  if (!result) return { data: [], sha: null }
  const records = Array.isArray(result.data) ? result.data : (result.data.records || [])
  return { data: records, sha: result.sha }
}

export async function saveAttendance(group, section, records, sha = null) {
  const path = attendancePath(group, section)
  const existing = await readFile(path)
  const meta = existing?.data && !Array.isArray(existing.data)
    ? { group: existing.data.group, sectionId: existing.data.sectionId, sectionName: existing.data.sectionName }
    : {}
  return await writeFile(path, { ...meta, records }, sha, `تحديث غياب ${group}-${section}`)
}

export async function recordDayAttendance(group, section, date, absentIds, teacher) {
  const { data: records, sha } = await getAttendance(group, section)
  const filtered = records.filter(r => r.date !== date)
  if (absentIds.length > 0) {
    filtered.push({ date, absentStudentIds: absentIds, recordedBy: teacher, recordedAt: new Date().toISOString() })
  }
  filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
  return await saveAttendance(group, section, filtered, sha)
}

export async function deleteDayAttendance(group, section, date) {
  const { data: records, sha } = await getAttendance(group, section)
  return await saveAttendance(group, section, records.filter(r => r.date !== date), sha)
}

export async function editDayAttendance(group, section, date, newAbsentIds, teacher) {
  return await recordDayAttendance(group, section, date, newAbsentIds, teacher)
}

export function getAbsenceInRange(records, fromDate, toDate) {
  return records.filter(r => r.date >= fromDate && r.date <= toDate)
}
