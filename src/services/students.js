import { readFile, writeFile, studentsPath } from './githubApi'

const SECTIONS = [
  { id: '1',  name: 'السيدة خديجة الكبرى' },
  { id: '2',  name: 'السيدة فاطمة الزهراء' },
  { id: '3',  name: 'السيدة زينب' },
  { id: '4',  name: 'السيدة رقية' },
  { id: '5',  name: 'رياحين الجنة' },
  { id: '6',  name: 'نور الرحمن' },
  { id: '7',  name: 'السيدة أسماء أبي بكر' },
  { id: '8',  name: 'السيدة أم كلثوم' },
  { id: '9',  name: 'السيدة أم سلمة' },
  { id: '10', name: 'السيدة عائشة الرضى' },
  { id: '11', name: 'السيدة حفصة بنت عمر' },
]

const GROUPS = [
  { key: 'أ', label: 'مجموعة أ' },
  { key: 'ب', label: 'مجموعة ب' },
]

export function getAllGroupSections() {
  const result = []
  for (const g of GROUPS) {
    for (const s of SECTIONS) {
      result.push({ group: g.key, groupLabel: g.label, section: s.id, sectionName: s.name })
    }
  }
  return result
}

export function getSections() { return SECTIONS }
export function getGroups() { return GROUPS }

export async function getStudents(group, section) {
  const result = await readFile(studentsPath(group, section))
  if (!result) return { data: [], sha: null }
  const students = Array.isArray(result.data) ? result.data : (result.data.students || [])
  return { data: students, sha: result.sha }
}

export async function saveStudents(group, section, students, sha = null) {
  const path = studentsPath(group, section)
  const existing = await readFile(path)
  const meta = existing?.data && !Array.isArray(existing.data)
    ? { group: existing.data.group, sectionId: existing.data.sectionId, sectionName: existing.data.sectionName }
    : {}
  return await writeFile(path, { ...meta, students }, sha, `تحديث طلاب ${group}-${section}`)
}

export async function addStudent(group, section, name) {
  const { data: students, sha } = await getStudents(group, section)
  const newStudent = { id: Date.now().toString(), name, group, section, createdAt: new Date().toISOString() }
  const result = await saveStudents(group, section, [...students, newStudent], sha)
  return { student: newStudent, result }
}

export async function updateStudent(group, section, studentId, updates) {
  const { data: students, sha } = await getStudents(group, section)
  return await saveStudents(group, section, students.map(s => s.id === studentId ? { ...s, ...updates } : s), sha)
}

export async function deleteStudent(group, section, studentId) {
  const { data: students, sha } = await getStudents(group, section)
  return await saveStudents(group, section, students.filter(s => s.id !== studentId), sha)
}
