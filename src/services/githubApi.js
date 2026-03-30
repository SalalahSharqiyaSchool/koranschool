// GitHub API Service
// يتعامل مع قراءة وكتابة الملفات على GitHub

const GITHUB_API = 'https://api.github.com'
const REPO_OWNER = 'SalalahSharqiyaSchool'
const REPO_NAME = 'koranschool'
const DATA_BRANCH = 'main'

function getToken() {
  return localStorage.getItem('gh_token') || ''
}

function headers() {
  return {
    'Authorization': `token ${getToken()}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }
}

// قراءة ملف من GitHub
export async function readFile(path) {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${DATA_BRANCH}&t=${Date.now()}`,
      { headers: headers() }
    )
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`GitHub error: ${res.status}`)
    const data = await res.json()
    const content = atob(data.content.replace(/\n/g, ''))
    return { data: JSON.parse(content), sha: data.sha }
  } catch (e) {
    if (e.message?.includes('404')) return null
    throw e
  }
}

// كتابة ملف على GitHub
export async function writeFile(path, content, sha = null, message = 'تحديث البيانات') {
  const body = {
    message,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
    branch: DATA_BRANCH,
  }
  if (sha) body.sha = sha

  const res = await fetch(
    `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    { method: 'PUT', headers: headers(), body: JSON.stringify(body) }
  )
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'فشل في حفظ الملف')
  }
  return await res.json()
}

// حذف ملف من GitHub
export async function deleteFile(path, sha, message = 'حذف ملف') {
  const res = await fetch(
    `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    {
      method: 'DELETE',
      headers: headers(),
      body: JSON.stringify({ message, sha, branch: DATA_BRANCH })
    }
  )
  if (!res.ok) throw new Error('فشل في حذف الملف')
}

// قائمة الملفات في مجلد
export async function listFiles(path) {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${DATA_BRANCH}`,
      { headers: headers() }
    )
    if (res.status === 404) return []
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

// مسار ملف الطلاب
export function studentsPath(group, section) {
  return `data/students/${group}-${section}.json`
}

// مسار ملف الغياب
export function attendancePath(group, section) {
  return `data/attendance/${group}-${section}.json`
}

// مسار ملف المعلمين
export const teachersPath = 'data/teachers.json'
