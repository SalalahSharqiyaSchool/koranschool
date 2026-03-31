import { useState, useEffect } from 'react'
import { getGroups, getSections, getStudents, addStudent, updateStudent, deleteStudent, saveStudents } from '../../services/students'
import { writeFile, studentsPath } from '../../services/githubApi'

export default function AdminStudents() {
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [students, setStudents] = useState([])
  const [sha, setSha] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [bulkText, setBulkText] = useState('')
  const [showBulk, setShowBulk] = useState(false)

  const groups = getGroups()
  const sections = getSections()

  useEffect(() => { if (selectedGroup && selectedSection) loadStudents() }, [selectedGroup, selectedSection])

  async function loadStudents() {
    setLoading(true)
    setMsg(null)
    try {
      const result = await getStudents(selectedGroup, selectedSection)
      setStudents(result.data)
      setSha(result.sha)
    } catch (e) { setMsg({ type: 'error', text: 'فشل التحميل' }) }
    setLoading(false)
  }

  function showMsg(type, text) {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  async function handleAdd() {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const result = await addStudent(selectedGroup, selectedSection, newName.trim())
      setStudents(prev => [...prev, result.student])
      setNewName('')
      showMsg('success', 'تمت الإضافة ✅')
    } catch (e) { showMsg('error', 'فشل: ' + e.message) }
    setSaving(false)
  }

  async function handleBulk() {
    const names = bulkText.split('\n').map(n => n.trim()).filter(Boolean)
    if (!names.length) return
    setSaving(true)
    try {
      const { data: existing, sha: existingSha } = await getStudents(selectedGroup, selectedSection)
      const newStudents = names.map(name => ({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        name, group: selectedGroup, section: selectedSection, createdAt: new Date().toISOString(),
      }))
      const all = [...existing, ...newStudents]
      await saveStudents(selectedGroup, selectedSection, all, existingSha)
      setStudents(all)
      setBulkText('')
      setShowBulk(false)
      showMsg('success', `تمت إضافة ${names.length} طالب ✅`)
    } catch (e) { showMsg('error', 'فشل: ' + e.message) }
    setSaving(false)
  }

  async function handleEdit(id, name) {
    setSaving(true)
    try {
      await updateStudent(selectedGroup, selectedSection, id, { name })
      setStudents(prev => prev.map(s => s.id === id ? { ...s, name } : s))
      setEditId(null)
      showMsg('success', 'تم التعديل ✅')
    } catch (e) { showMsg('error', 'فشل: ' + e.message) }
    setSaving(false)
  }

  async function handleDelete(id, name) {
    if (!confirm(`حذف الطالب "${name}"؟`)) return
    setSaving(true)
    try {
      await deleteStudent(selectedGroup, selectedSection, id)
      setStudents(prev => prev.filter(s => s.id !== id))
      showMsg('success', 'تم الحذف')
    } catch (e) { showMsg('error', 'فشل: ' + e.message) }
    setSaving(false)
  }

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">إدارة الطلاب</h1>

      <div className="card mb-5">
        <h2 className="font-bold text-gray-700 mb-3">اختر المجموعة والشعبة</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">المجموعة</label>
            <select className="input-field" value={selectedGroup} onChange={e => { setSelectedGroup(e.target.value); setSelectedSection(''); setStudents([]) }}>
              <option value="">-- اختر --</option>
              {groups.map(g => <option key={g.key} value={g.key}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">الشعبة</label>
            <select className="input-field" value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedGroup}>
              <option value="">-- اختر --</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedGroup && selectedSection && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-700">
                {groups.find(g=>g.key===selectedGroup)?.label} — {sections.find(s=>s.id===selectedSection)?.name}
              </h2>
              <p className="text-sm text-gray-400">{students.length} طالب</p>
            </div>
            <button onClick={() => setShowBulk(!showBulk)} className="text-sm text-blue-600 hover:underline">
              استيراد جماعي
            </button>
          </div>

          {showBulk && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700 font-medium mb-2">أدخل اسماً في كل سطر</p>
              <textarea className="input-field h-28 text-sm" placeholder="أحمد محمد&#10;سالم علي&#10;خالد عمر" value={bulkText} onChange={e => setBulkText(e.target.value)} />
              <div className="flex gap-2 mt-2">
                <button onClick={handleBulk} disabled={saving} className="btn-primary text-sm">استيراد</button>
                <button onClick={() => setShowBulk(false)} className="btn-secondary text-sm">إلغاء</button>
              </div>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <input className="input-field flex-1" placeholder="اسم الطالب الجديد" value={newName}
              onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            <button onClick={handleAdd} disabled={saving || !newName.trim()} className="btn-primary px-5">إضافة</button>
          </div>

          {msg && (
            <div className={`rounded-lg p-3 mb-3 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {msg.text}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 text-gray-400">جارٍ التحميل...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-gray-400">لا يوجد طلاب. أضف طالباً أو استورد قائمة.</div>
          ) : (
            <div className="space-y-2">
              {students.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  {editId === s.id ? (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-gray-400 text-sm w-6">{i+1}</span>
                        <input className="input-field flex-1 py-1" value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
                      </div>
                      <div className="flex gap-2 mr-2">
                        <button onClick={() => handleEdit(s.id, editName)} disabled={saving} className="btn-success text-xs py-1 px-3">حفظ</button>
                        <button onClick={() => setEditId(null)} className="btn-secondary text-xs py-1 px-3">إلغاء</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-6">{i+1}</span>
                        <span className="font-medium text-gray-800">{s.name}</span>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => { setEditId(s.id); setEditName(s.name) }} className="text-xs text-blue-600 hover:underline">تعديل</button>
                        <button onClick={() => handleDelete(s.id, s.name)} className="text-xs text-red-500 hover:underline">حذف</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
