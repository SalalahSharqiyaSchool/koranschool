import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getAllGroupSections, getSections, getGroups, getStudents } from '../../services/students'
import { getAttendance, recordDayAttendance } from '../../services/attendance'

export default function TeacherAttendance() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [absentIds, setAbsentIds] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const groups = getGroups()
  const sections = getSections()
  const today = new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  async function loadStudents() {
    if (!selectedGroup || !selectedSection) return
    setLoading(true)
    setError('')
    setSaved(false)
    try {
      const { data: sts } = await getStudents(selectedGroup, selectedSection)
      setStudents(sts)
      const { data: records } = await getAttendance(selectedGroup, selectedSection)
      const existing = records.find(r => r.date === selectedDate)
      setAbsentIds(existing ? [...existing.absentStudentIds] : [])
      setStep(2)
    } catch (e) {
      setError('فشل تحميل البيانات. تحقق من الاتصال.')
    }
    setLoading(false)
  }

  function toggleAbsent(id) {
    setAbsentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await recordDayAttendance(selectedGroup, selectedSection, selectedDate, absentIds, user.username)
      setSaved(true)
    } catch (e) {
      setError('فشل الحفظ: ' + e.message)
    }
    setSaving(false)
  }

  function reset() {
    setStep(1)
    setStudents([])
    setAbsentIds([])
    setSaved(false)
    setError('')
    setSelectedGroup('')
    setSelectedSection('')
  }

  const sectionName = sections.find(s => s.id === selectedSection)?.name || ''
  const groupLabel = groups.find(g => g.key === selectedGroup)?.label || ''

  return (
    <div>
      {/* Date header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">تسجيل الغياب</h2>
        <p className="text-gray-500 mt-1">{today}</p>
      </div>

      {step === 1 && (
        <div className="card max-w-lg mx-auto">
          <h3 className="font-bold text-gray-700 mb-5 text-center text-lg">اختر المجموعة والشعبة</h3>

          <div className="space-y-4">
            <div>
              <label className="label">التاريخ</label>
              <input type="date" className="input-field" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            </div>

            <div>
              <label className="label">المجموعة</label>
              <div className="grid grid-cols-2 gap-3">
                {groups.map(g => (
                  <button
                    key={g.key}
                    onClick={() => setSelectedGroup(g.key)}
                    className={`py-4 rounded-xl border-2 font-bold text-lg transition-all ${
                      selectedGroup === g.key
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedGroup && (
              <div>
                <label className="label">الشعبة (الحلقة)</label>
                <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto">
                  {sections.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSection(s.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all text-right ${
                        selectedSection === s.id
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                      }`}
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="text-xs text-gray-400">شعبة {s.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">⚠️ {error}</div>}

            <button
              onClick={loadStudents}
              disabled={!selectedGroup || !selectedSection || loading}
              className="btn-teal w-full py-3 text-base flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"/>جارٍ التحميل...</>
                : '📋 عرض قائمة الطلاب'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{groupLabel} — {sectionName}</h3>
              <p className="text-sm text-gray-400">{new Date(selectedDate).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600">← تغيير</button>
          </div>

          {/* Stats */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 bg-green-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{students.length - absentIds.length}</p>
              <p className="text-xs text-green-500 mt-1">حاضر</p>
            </div>
            <div className="flex-1 bg-red-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-red-600">{absentIds.length}</p>
              <p className="text-xs text-red-500 mt-1">غائب</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-600">{students.length}</p>
              <p className="text-xs text-gray-400 mt-1">المجموع</p>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-xs text-gray-400 text-center mb-3">اضغط على اسم الطالب لتغيير حضوره</p>

          {students.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p>لا يوجد طلاب في هذه المجموعة</p>
              <p className="text-xs mt-1">أضف طلاباً من لوحة الإدارة</p>
            </div>
          ) : (
            <div className="space-y-2 mb-5">
              {students.map((s, i) => {
                const isAbsent = absentIds.includes(s.id)
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleAbsent(s.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                      isAbsent
                        ? 'bg-red-50 border-red-300'
                        : 'bg-green-50 border-green-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isAbsent ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}>
                        {i + 1}
                      </span>
                      <span className={`font-medium text-base ${isAbsent ? 'text-red-700' : 'text-green-800'}`}>{s.name}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${isAbsent ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {isAbsent ? '❌ غائب' : '✅ حاضر'}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-3">⚠️ {error}</div>}

          {saved && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-3 flex items-center gap-2">
              ✅ تم حفظ الغياب بنجاح — {absentIds.length} طالب غائب
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || students.length === 0}
              className="btn-success flex-1 py-3 flex items-center justify-center gap-2 text-base"
            >
              {saving ? <><span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"/>حفظ...</> : '💾 حفظ الغياب'}
            </button>
            <button onClick={reset} className="btn-secondary px-5">مجموعة أخرى</button>
          </div>
        </div>
      )}
    </div>
  )
}
