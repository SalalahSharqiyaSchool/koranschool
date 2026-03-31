import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const nav = [
  { to: '/admin', label: 'الرئيسية', icon: '🏠', end: true },
  { to: '/admin/attendance', label: 'الغياب', icon: '📋' },
  { to: '/admin/reports', label: 'التقارير', icon: '📊' },
  { to: '/admin/students', label: 'الطلاب', icon: '👥' },
  { to: '/admin/teachers', label: 'المعلمون', icon: '👨‍🏫' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-l border-gray-100 flex flex-col shadow-sm no-print">
        <div className="p-5 bg-gradient-to-b from-blue-700 to-blue-800 text-white">
          <p className="text-blue-200 text-xs">وزارة التعليم — محافظة ظفار</p>
          <h1 className="font-bold text-base mt-1">مدرسة القرآن</h1>
          <p className="text-blue-200 text-xs mt-1">2025-2026</p>
          <div className="mt-3 bg-blue-600/50 rounded-lg px-3 py-1.5 text-xs inline-block">
            لوحة الإدارة
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              {user?.name?.[0] || 'م'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-400">مدير النظام</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full text-sm text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
