import { useState, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { getAllGroupSections, getGroups, getSections, getStudents } from '../../services/students'
import { getAttendance, deleteDayAttendance, editDayAttendance } from '../../services/attendance'
import { useAuth } from '../../context/AuthContext'

export default function AdminReports() {
  const { user } = useAuth()
  const printRef = useRef()
  const [mode, setMode] = useState('class')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0])
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(null)
  const [editAbsent, setEditAbsent] = useState([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  const groups = getGroups()
  const sections = getSections()

  async function loadStudentsList(g, s) {
    if (!g || !s) return
    const { data } = await getStudents(g, s)
    setStudents(data)
  }

  async function generateReport() {
    if (!selectedGroup || !selectedSection) return setMsg({ type: 'error', text: 'اختر المجموعة والشعبة' })
    setLoading(true)
    setReport(null)
    setMsg(null)
    try {
      const { data: sts } = await getStudents(selectedGroup, selectedSection)
      const { data: allRecords } = await getAttendance(selectedGroup, selectedSection)
      const records = allRecords.filter(r => r.date >= fromDate && r.date <= toDate)
      const sectionName = sections.find(s => s.id === selectedSection)?.name || selectedSection
      const groupLabel = groups.find(g => g.key === selectedGroup)?.label || selectedGroup

      if (mode === 'class') {
        const rows = records.map(r => ({
          date: r.date,
          absentCount: r.absentStudentIds.length,
          absentNames: r.absentStudentIds.map(id => sts.find(s => s.id === id)?.name || 'غير معروف'),
          absentIds: r.absentStudentIds,
          recordedBy: r.recordedBy,
        }))
        setReport({ type: 'class', rows, total: rows.reduce((a, r) => a + r.absentCount, 0), students: sts, sectionName, groupLabel })
      } else {
        if (!selectedStudent) { setMsg({ type: 'error', text: 'اختر طالباً' }); setLoading(false); return }
        const student = sts.find(s => s.id === selectedStudent)
        const rows = records.filter(r => r.absentStudentIds.includes(selectedStudent)).map(r => ({ date: r.date, recordedBy: r.recordedBy }))
        setReport({ type: 'student', student, rows, total: rows.length, sectionName, groupLabel })
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'فشل: ' + e.message })
    }
    setLoading(false)
  }

  async function handleDelete(date) {
    if (!confirm(`حذف سجل غياب يوم ${formatDate(date)}؟`)) return
    try {
      await deleteDayAttendance(selectedGroup, selectedSection, date)
      setMsg({ type: 'success', text: 'تم الحذف' })
      generateReport()
    } catch (e) { setMsg({ type: 'error', text: 'فشل: ' + e.message }) }
  }

  async function saveEdit() {
    setSaving(true)
    try {
      await editDayAttendance(selectedGroup, selectedSection, editMode, editAbsent, user.username)
      setMsg({ type: 'success', text: 'تم التعديل' })
      setEditMode(null)
      generateReport()
    } catch (e) { setMsg({ type: 'error', text: 'فشل: ' + e.message }) }
    setSaving(false)
  }

  const handlePrint = useReactToPrint({ content: () => printRef.current })

  function formatDate(d) {
    return new Date(d).toLocaleDateString('ar-SA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">التقارير</h1>

      <div className="card mb-5">
        <h2 className="font-bold text-gray-700 mb-4">إعدادات التقرير</h2>

        <div className="flex gap-3 mb-4">
          {[{v:'class',l:'📚 تقرير صف كامل'},{v:'student',l:'👤 تقرير طالب'}].map(m => (
            <button key={m.v} onClick={() => setMode(m.v)}
              className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${mode === m.v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}>
              {m.l}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="label">من</label>
            <input type="date" className="input-field" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="label">إلى</label>
            <input type="date" className="input-field" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
          <div>
            <label className="label">المجموعة</label>
            <select className="input-field" value={selectedGroup} onChange={e => { setSelectedGroup(e.target.value); setSelectedSection(''); setStudents([]) }}>
              <option value="">-- اختر --</option>
              {groups.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">الشعبة</label>
            <select className="input-field" value={selectedSection} onChange={e => { setSelectedSection(e.target.value); loadStudentsList(selectedGroup, e.target.value) }} disabled={!selectedGroup}>
              <option value="">-- اختر --</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {mode === 'student' && (
          <div className="mb-3">
            <label className="label">الطالب</label>
            <select className="input-field" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
              <option value="">-- اختر طالباً --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={generateReport} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/>جارٍ...</> : '🔍 عرض التقرير'}
          </button>
          {report && <button onClick={handlePrint} className="btn-secondary flex items-center gap-2">🖨️ طباعة</button>}
        </div>
      </div>

      {msg && (
        <div className={`rounded-lg p-3 mb-4 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {report && (
        <div ref={printRef} className="card">
          <div className="print-only hidden mb-6 text-center border-b pb-4">
            <p className="text-sm">وزارة التعليم — محافظة ظفار</p>
            <h1 className="text-xl font-bold">مدرسة القرآن الكريم</h1>
            <p className="font-medium mt-2">
              {report.type === 'class' ? `تقرير غياب — ${report.groupLabel} / ${report.sectionName}` : `تقرير غياب — ${report.student?.name}`}
            </p>
            <p className="text-sm text-gray-500">من {formatDate(fromDate)} إلى {formatDate(toDate)}</p>
          </div>

          <div className="flex items-center justify-between mb-4 no-print">
            <h2 className="font-bold text-gray-800">
              {report.type === 'class' ? `${report.groupLabel} / ${report.sectionName}` : report.student?.name}
            </h2>
            <span className="badge-absent text-sm px-3 py-1">إجمالي: {report.total} يوم غياب</span>
          </div>

          {report.rows.length === 0 ? (
            <p className="text-center text-gray-400 py-8">لا يوجد غياب في هذه الفترة ✅</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-right p-3 font-medium text-gray-600">#</th>
                    <th className="text-right p-3 font-medium text-gray-600">التاريخ</th>
                    {report.type === 'class' && <>
                      <th className="text-right p-3 font-medium text-gray-600">عدد الغائبين</th>
                      <th className="text-right p-3 font-medium text-gray-600">الأسماء</th>
                    </>}
                    <th className="text-right p-3 font-medium text-gray-600 no-print">بواسطة</th>
                    <th className="text-right p-3 font-medium text-gray-600 no-print">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {report.rows.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-gray-400">{i + 1}</td>
                      <td className="p-3 font-medium">{formatDate(row.date)}</td>
                      {report.type === 'class' && <>
                        <td className="p-3"><span className="badge-absent">{row.absentCount}</span></td>
                        <td className="p-3 text-gray-700">
                          {editMode === row.date ? (
                            <div className="space-y-1">
                              {report.students.map(s => (
                                <label key={s.id} className="flex items-center gap-2 cursor-pointer text-xs">
                                  <input type="checkbox" checked={editAbsent.includes(s.id)}
                                    onChange={() => setEditAbsent(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])} />
                                  {s.name}
                                </label>
                              ))}
                              <div className="flex gap-2 mt-2">
                                <button onClick={saveEdit} disabled={saving} className="btn-success text-xs py-1 px-3">{saving ? 'حفظ...' : 'حفظ'}</button>
                                <button onClick={() => setEditMode(null)} className="btn-secondary text-xs py-1 px-3">إلغاء</button>
                              </div>
                            </div>
                          ) : row.absentNames.join('، ')}
                        </td>
                      </>}
                      <td className="p-3 text-gray-400 no-print">{row.recordedBy}</td>
                      <td className="p-3 no-print">
                        {editMode !== row.date && (
                          <div className="flex gap-2">
                            {report.type === 'class' && (
                              <button onClick={() => { setEditMode(row.date); setEditAbsent(row.absentIds) }} className="text-xs text-blue-600 hover:underline">تعديل</button>
                            )}
                            <button onClick={() => handleDelete(row.date)} className="text-xs text-red-500 hover:underline">حذف</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
