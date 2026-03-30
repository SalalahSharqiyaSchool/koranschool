import { readFile, writeFile, studentsPath, listFiles } from './githubApi'

// جلب قائمة الطلاب لمجموعة وشعبة
export async function getStudents(group, section) {
  const result = await readFile(studentsPath(group, section))
  return result ? result : { data: [], sha: null }
}

// حفظ قائمة الطلاب
export async function saveStudents(group, section, students, sha = null) {
  const path = studentsPath(group, section)
  return await writeFile(path, students, sha, `تحديث طلاب ${group} - ${section}`)
}

// إضافة طالب جديد
export async function addStudent(group, section, student) {
  const { data: students, sha } = await getStudents(group, section)
  const newStudent = {
    id: Date.now().toString(),
    name: student.name,
    group,
    section,
    createdAt: new Date().toISOString(),
  }
  const updated = [...students, newStudent]
  const result = await saveStudents(group, section, updated, sha)
  return { student: newStudent, result }
}

// تعديل طالب
export async function updateStudent(group, section, studentId, updates) {
  const { data: students, sha } = await getStudents(group, section)
  const updated = students.map(s => s.id === studentId ? { ...s, ...updates } : s)
  return await saveStudents(group, section, updated, sha)
}

// حذف طالب
export async function deleteStudent(group, section, studentId) {
  const { data: students, sha } = await getStudents(group, section)
  const updated = students.filter(s => s.id !== studentId)
  return await saveStudents(group, section, updated, sha)
}

// جلب كل المجموعات والشعب
export async function getAllGroupSections() {
  const files = await listFiles('data/students')
  return files
    .filter(f => f.name.endsWith('.json'))
    .map(f => {
      const name = f.name.replace('.json', '')
      const parts = name.split('-')
      // الصيغة: group-section (قد يحتوي الاسم على شرطات)
      return { group: parts[0], section: parts.slice(1).join('-'), filename: f.name }
    })
}
