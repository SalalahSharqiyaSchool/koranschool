import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getAllGroupSections } from '../../services/students'

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const groups = getAllGroupSections()
  const today = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const cards = [
    { label: 'تسجيل الغياب', icon: '📋', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100', action: '/admin/attendance' },
    { label: 'التقارير', icon: '📊', color: 'bg-purple-50 text-purple-600', border: 'border-purple-100', action: '/admin/reports' },
    { label: 'إدارة الطلاب', icon: '👥', color: 'bg-teal-50 text-teal-600', border: 'border-teal-100', action: '/admin/students' },
    { label: 'إدارة المعلمين', icon: '👨‍🏫', color: 'bg-orange-50 text-orange-600', border: 'border-orange-100', action: '/admin/teachers' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">أهلاً، {user?.name} 👋</h1>
        <p className="text-gray-400 text-sm mt-1">{today}</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <button key={i} onClick={() => navigate(c.action)}
            className={`card border ${c.border} text-right hover:shadow-md transition-all cursor-pointer`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${c.color}`}>
              {c.icon}
            </div>
            <p className="font-bold text-gray-800">{c.label}</p>
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">المجموعات والشعب ({groups.length})</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {groups.map((g, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ml-2 ${g.group === 'أ' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                  {g.group === 'أ' ? 'مج أ' : 'مج ب'}
                </span>
                <span className="text-sm font-medium text-gray-700">{g.sectionName}</span>
              </div>
              <span className="text-xs text-gray-400">شعبة {g.section}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
