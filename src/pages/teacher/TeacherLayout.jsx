import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function TeacherLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'}}>
      {/* Header */}
      <header className="bg-teal-700 text-white shadow-lg no-print">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-teal-200 text-xs">وزارة التعليم — محافظة ظفار</p>
            <h1 className="font-bold text-lg">مدرسة القرآن الكريم</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-teal-300 text-xs">معلم</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center font-bold text-sm">
              {user?.name?.[0] || 'م'}
            </div>
            <button onClick={() => { logout(); navigate('/login') }} className="text-teal-200 hover:text-white text-sm transition-colors">
              خروج
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
