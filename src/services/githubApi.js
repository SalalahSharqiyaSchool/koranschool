const GITHUB_API = 'https://api.github.com'
const REPO_OWNER = 'SalalahSharqiyaSchool'
const REPO_NAME = 'koranschool'
const DATA_BRANCH = 'main'

// التوكن: أولاً من Vercel env، ثم من localStorage (للمدير)
function getToken() {
  return import.meta.env.VITE_GITHUB_TOKEN || localStorage.getItem('gh_token') || ''
}

function headers() {
  return {
    'Authorization': `token ${getToken()}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }
}

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

export async function listFiles(path) {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}?ref=${DATA_BRANCH}`,
      { headers: headers() }
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch { return [] }
}

function groupKey(group) {
  if (group === 'أ' || group === 'a') return 'a'
  if (group === 'ب' || group === 'b') return 'b'
  return group.toLowerCase()
}

export function studentsPath(group, section) {
  return `data/students/${groupKey(group)}-${section}.json`
}

export function attendancePath(group, section) {
  return `data/attendance/${groupKey(group)}-${section}.json`
}

export const teachersPath = 'data/teachers.json'
