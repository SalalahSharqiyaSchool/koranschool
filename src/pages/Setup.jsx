import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { writeFile, teachersPath } from '../services/githubApi'
import { hashPassword } from '../services/auth'

const DEFAULT_TEACHERS = [
  { username: 'faisal', name: 'فيصل العريبي', password: 'admin', role: 'admin' },
  { username: 'teacher1', name: 'معلم 1', password: '1234', role: 'teacher' },
  { username: 'teacher2', name: 'معلم 2', password: '12345', role: 'teacher' },
]

export default function Setup() {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSetup = async (e) => {
    e.preventDefault()
    if (!token) return setError('يرجى إدخال التوكن')
    setLoading(true)
    setError('')
    localStorage.setItem('gh_token', token)
    try {
      const teachers = await Promise.all(
        DEFAULT_TEACHERS.map(async t => ({
          username: t.username, name: t.name,
          password: await hashPassword(t.password), role: t.role,
        }))
      )
      await writeFile(teachersPath, teachers, null, 'إعداد أولي: ملف المعلمين')
      setDone(true)
    } catch (e) {
      setError('فشل الإعداد: ' + e.message)
    }
    setLoading(false)
    localStorage.removeItem('gh_token')
  }

  if (done) return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-800 mb-6">تم الإعداد بنجاح!</h2>
        <div className="bg-gray-50 rounded-xl p-4 text-right text-sm space-y-3 mb-6">
          <p className="font-bold text-gray-700 mb-2">بيانات الدخول:</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
              <span className="text-purple-600 text-xs font-medium">مدير</span>
              <span className="font-mono font-bold">faisal / admin</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-teal-50 rounded-lg">
              <span className="text-teal-600 text-xs font-medium">معلم</span>
              <span className="font-mono font-bold">teacher1 / 1234</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-teal-50 rounded-lg">
              <span className="text-teal-600 text-xs font-medium">معلم</span>
              <span className="font-mono font-bold">teacher2 / 12345</span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/login')} className="btn-primary w-full py-3">انتقل لتسجيل الدخول</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-7 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">⚙️</div>
          <h1 className="text-xl font-bold text-gray-800">الإعداد الأولي</h1>
          <p className="text-sm text-gray-400 mt-1">يُنفَّذ مرة واحدة فقط</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-sm text-amber-800">
          ⚠️ هذه الصفحة لإعداد النظام للمرة الأولى. ستنشئ ملف المعلمين على GitHub.
        </div>
        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="label">GitHub Token (Classic)</label>
            <input type="password" className="input-field" placeholder="ghp_..." value={token} onChange={e => setToken(e.target.value)} />
          </div>
          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg p-3">⚠️ {error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/>جارٍ الإعداد...</> : 'بدء الإعداد'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <a href="/login" className="text-sm text-gray-400 hover:text-gray-600">العودة لتسجيل الدخول</a>
        </div>
      </div>
    </div>
  )
}
