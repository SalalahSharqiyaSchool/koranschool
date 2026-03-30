import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getAllGroupSections, getStudents } from '../services/students'
import { getAttendance, recordDayAttendance } from '../services/attendance'

export default function Attendance() {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [absentIds, setAbsentIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [step, setStep] = useState(1) // 1=اختيار, 2=تسجيل

  useEffect(() => { loadGroups() }, [])

  async function loadGroups() {
    const gs = await getAllGroupSections()
    setGroups(gs)
  }

  async function loadStudentsAndAttendance() {
    if (!selectedGroup || !selectedSection) return
    setLoading(true)
    try {
      const { data: sts } = await getStudents(selectedGroup, selectedSection)
      setStudents(sts)
      const { data: records } = await getAttendance(selectedGroup, selectedSection)
      const todayRecord = records.find(r => r.date === selectedDate)
      setAbsentIds(todayRecord ? [...todayRecord.absentStudentIds] : [])
      setStep(2)
    } catch (e) {
      setMsg({ type: 'error', text: 'فشل تحميل البيانات: ' + e.message })
    }
    setLoading(false)
  }

  function toggleAbsent(id) {
    setAbsentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  async function handleSave() {
    setSaving(true)
    setMsg(null)
    try {
      await recordDayAttendance(selectedGroup, selectedSection, selectedDate, absentIds, user.username)
      setMsg({ type: 'success', text: `✅ تم حفظ الغياب بنجاح (${absentIds.length} طالب غائب)` })
    } catch (e) {
      setMsg({ type: 'error', text: '❌ فشل الحفظ: ' + e.message })
    }
    setSaving(false)
  }

  function reset() {
    setStep(1)
    setStudents([])
    setAbsentIds([])
    setMsg(null)
  }

  const uniqueGroups = [...new Set(groups.map(g => g.group))]
  const sections = groups.filter(g => g.group === selectedGroup).map(g => g.section)

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">تسجيل الغياب اليومي</h1>

      {/* Step 1: اختيار */}
      <div className="card mb-5">
        <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">1</span>
          اختيار التاريخ والمجموعة
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">التاريخ</label>
            <input
              type="date"
              className="input-field"
              value={selectedDate}
              onChange={e => { setSelectedDate(e.target.value); setStep(1) }}
            />
          </div>
          <div>
            <label className="label">المجموعة</label>
            <select className="input-field" value={selectedGroup} onChange={e => { setSelectedGroup(e.target.value); setSelectedSection(''); setStep(1) }}>
              <option value="">-- اختر --</option>
              {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label">الشعبة</label>
            <select className="input-field" value={selectedSection} onChange={e => { setSelectedSection(e.target.value); setStep(1) }} disabled={!selectedGroup}>
              <option value="">-- اختر --</option>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={loadStudentsAndAttendance}
          disabled={!selectedGroup || !selectedSection || loading}
          className="btn-primary mt-4 flex items-center gap-2"
        >
          {loading ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/>جارٍ التحميل...</> : '📋 عرض قائمة الطلاب'}
        </button>
      </div>

      {/* Step 2: قائمة الطلاب */}
      {step === 2 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-700 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">2</span>
              قائمة الطلاب — {selectedGroup} / {selectedSection}
            </h2>
            <div className="flex items-center gap-2">
              <span className="badge-absent">{absentIds.length} غائب</span>
              <span className="badge-present">{students.length - absentIds.length} حاضر</span>
            </div>
          </div>

          {students.length === 0 ? (
            <p className="text-center text-gray-400 py-8">لا يوجد طلاب في هذه المجموعة</p>
          ) : (
            <div className="space-y-2 mb-5">
              {students.map((s, i) => {
                const isAbsent = absentIds.includes(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleAbsent(s.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all text-right ${
                      isAbsent
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-green-50 border-green-200 text-green-800 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-sm font-bold text-gray-500 border">
                        {i + 1}
                      </span>
                      <span className="font-medium">{s.name}</span>
                    </div>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${isAbsent ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {isAbsent ? '❌ غائب' : '✅ حاضر'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {msg && (
            <div className={`rounded-lg p-3 mb-4 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {msg.text}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="btn-success flex items-center gap-2">
              {saving ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/>حفظ...</> : '💾 حفظ الغياب'}
            </button>
            <button onClick={reset} className="btn-secondary">تغيير المجموعة</button>
          </div>
        </div>
      )}
    </div>
  )
}
