import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'الرئيسية', icon: '🏠', end: true },
  { to: '/attendance', label: 'تسجيل الغياب', icon: '📋' },
  { to: '/reports', label: 'التقارير', icon: '📊' },
  { to: '/students', label: 'إدارة الطلاب', icon: '👥' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-100 flex flex-col shadow-sm no-print">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-primary-600">
          <div className="text-white">
            <p className="text-xs opacity-75">وزارة التعليم — محافظة ظفار</p>
            <h1 className="font-bold text-base leading-tight mt-1">مدرسة القرآن</h1>
            <p className="text-xs opacity-75 mt-1">العام الدراسي 2025-2026</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
              {user?.name?.[0] || 'م'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-400">معلم</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-sm text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded-lg transition-colors">
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
