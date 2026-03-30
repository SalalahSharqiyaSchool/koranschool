import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllGroupSections } from '../services/students'
import { getAttendance } from '../services/attendance'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [stats, setStats] = useState({ total: 0, todayAbsent: 0, groups: 0 })
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]
  const todayDisplay = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const gs = await getAllGroupSections()
      setGroups(gs)
      let todayAbsent = 0
      for (const g of gs) {
        const { data } = await getAttendance(g.group, g.section)
        const todayRecord = data.find(r => r.date === today)
        if (todayRecord) todayAbsent += todayRecord.absentStudentIds.length
      }
      setStats({ groups: gs.length, todayAbsent })
    } catch {}
    setLoading(false)
  }

  const cards = [
    { label: 'المجموعات والشعب', value: stats.groups, icon: '📚', color: 'text-primary-600 bg-primary-50', action: () => navigate('/students') },
    { label: 'غياب اليوم', value: stats.todayAbsent, icon: '📋', color: 'text-red-600 bg-red-50', action: () => navigate('/attendance') },
    { label: 'تسجيل الغياب', value: '←', icon: '✏️', color: 'text-orange-600 bg-orange-50', action: () => navigate('/attendance') },
    { label: 'التقارير', value: '←', icon: '📊', color: 'text-green-600 bg-green-50', action: () => navigate('/reports') },
  ]

  return (
    <div className="p-6">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">أهلاً، {user?.name} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">{todayDisplay}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <button key={i} onClick={card.action} className="card text-right hover:shadow-md transition-shadow cursor-pointer">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${card.color}`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{loading ? '...' : card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </button>
        ))}
      </div>

      {/* Groups list */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">المجموعات والشعب</h2>
          <button onClick={() => navigate('/students')} className="text-sm text-primary-600 hover:underline">إدارة الطلاب</button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-400">جارٍ التحميل...</div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-3">لا توجد مجموعات بعد</p>
            <button onClick={() => navigate('/students')} className="btn-primary text-sm">إضافة مجموعة وطلاب</button>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((g, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <span className="font-medium text-gray-800">مجموعة: {g.group}</span>
                  <span className="text-gray-400 mx-2">|</span>
                  <span className="text-gray-600">شعبة: {g.section}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate('/attendance')} className="text-xs btn-primary py-1 px-3">تسجيل غياب</button>
                  <button onClick={() => navigate('/reports')} className="text-xs btn-secondary py-1 px-3">تقرير</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
