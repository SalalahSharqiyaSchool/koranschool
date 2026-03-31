import { readFile, teachersPath } from './githubApi'

export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'school_salt_2025')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function login(username, password) {
  try {
    const result = await readFile(teachersPath)
    if (!result) return { success: false, error: 'ملف المعلمين غير موجود. تواصل مع المدير.' }
    const teachers = result.data
    const teacher = teachers.find(t => t.username === username)
    if (!teacher) return { success: false, error: 'اسم المستخدم غير صحيح' }
    const hashed = await hashPassword(password)
    if (teacher.password !== hashed) return { success: false, error: 'كلمة المرور غير صحيحة' }
    const session = { username: teacher.username, name: teacher.name, role: teacher.role }
    localStorage.setItem('session', JSON.stringify(session))
    return { success: true, teacher: session }
  } catch (e) {
    return { success: false, error: 'فشل الاتصال بالخادم. حاول مجدداً.' }
  }
}

export function logout() {
  localStorage.removeItem('session')
  localStorage.removeItem('gh_token')
}

export function getSession() {
  try {
    const s = localStorage.getItem('session')
    return s ? JSON.parse(s) : null
  } catch { return null }
}
