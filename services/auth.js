import { readFile, teachersPath } from './githubApi'

// تشفير بسيط لكلمة المرور (hash)
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'school_salt_2025')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// تسجيل الدخول
export async function login(username, password, token) {
  localStorage.setItem('gh_token', token)
  try {
    const result = await readFile(teachersPath)
    if (!result) {
      localStorage.removeItem('gh_token')
      return { success: false, error: 'ملف المعلمين غير موجود. يرجى التهيئة الأولى.' }
    }
    const teachers = result.data
    const teacher = teachers.find(t => t.username === username)
    if (!teacher) {
      localStorage.removeItem('gh_token')
      return { success: false, error: 'اسم المستخدم غير صحيح' }
    }
    const hashed = await hashPassword(password)
    if (teacher.password !== hashed) {
      localStorage.removeItem('gh_token')
      return { success: false, error: 'كلمة المرور غير صحيحة' }
    }
    const session = { username: teacher.username, name: teacher.name, role: teacher.role }
    localStorage.setItem('session', JSON.stringify(session))
    return { success: true, teacher: session }
  } catch (e) {
    localStorage.removeItem('gh_token')
    return { success: false, error: 'فشل الاتصال بـ GitHub. تحقق من التوكن.' }
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

export function isLoggedIn() {
  return !!getSession()
}
