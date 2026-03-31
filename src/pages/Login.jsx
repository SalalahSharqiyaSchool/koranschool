import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/auth'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) return setError('يرجى تعبئة جميع الحقول')
    setLoading(true)
    setError('')
    const result = await login(form.username, form.password)
    setLoading(false)
    if (result.success) {
      authLogin(result.teacher)
      navigate(result.teacher.role === 'admin' ? '/admin' : '/teacher')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen flex" style={{background: 'linear-gradient(135deg, #1e3a5f 0%, #0f6e56 100%)'}}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-12 text-white">
        <div className="text-8xl mb-8">📚</div>
        <h2 className="text-3xl font-bold mb-4 text-center">نظام رصد الغياب</h2>
        <p className="text-white/70 text-center text-lg">مدرسة القرآن الكريم</p>
        <p className="text-white/50 text-center mt-2">محافظة ظفار — 2025/2026</p>
        <div className="mt-12 space-y-4 w-full max-w-xs">
          {['تسجيل الغياب اليومي', 'تقارير مفصلة', 'إدارة الطلاب والمجموعات'].map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <span className="text-green-400 text-lg">✓</span>
              <span className="text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">📚</div>
            <h1 className="text-xl font-bold text-gray-800">تسجيل الدخول</h1>
            <p className="text-gray-400 text-sm mt-1">وزارة التعليم — محافظة ظفار</p>
          </div>

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

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg p-3 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
              {loading ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/><span>جارٍ التحقق...</span></> : 'دخول'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <a href="/setup" className="text-xs text-gray-400 hover:text-gray-600">إعداد النظام (المرة الأولى)</a>
          </div>
        </div>
      </div>
    </div>
  )
}
