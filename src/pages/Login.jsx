import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '', token: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password || !form.token) {
      setError('يرجى تعبئة جميع الحقول')
      return
    }
    setLoading(true)
    setError('')
    const result = await login(form.username, form.password, form.token)
    setLoading(false)
    if (result.success) {
      authLogin(result.teacher)
      navigate('/')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center text-white mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 backdrop-blur-sm">
            📚
          </div>
          <p className="text-primary-200 text-sm">وزارة التعليم — محافظة ظفار</p>
          <h1 className="text-2xl font-bold mt-1">مدرسة القرآن</h1>
          <p className="text-primary-200 text-sm mt-1">نظام رصد الغياب — 2025/2026</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-7">
          <h2 className="text-lg font-bold text-gray-800 mb-5">تسجيل الدخول</h2>
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="label">اسم المستخدم</label>
              <input
                className="input-field"
                placeholder="أدخل اسم المستخدم"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <input
                type="password"
                className="input-field"
                placeholder="أدخل كلمة المرور"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="label">رمز GitHub (Token)</label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  className="input-field pl-10"
                  placeholder="ghp_..."
                  value={form.token}
                  onChange={e => setForm({...form, token: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                >
                  {showToken ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">يُحفظ محلياً فقط ولا يُرسل لأي خادم</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg p-3">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/><span>جارٍ التحقق...</span></>
              ) : 'دخول'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400">
              إعداد أول مرة؟{' '}
              <a href="/setup" className="text-primary-600 hover:underline">انقر هنا</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
