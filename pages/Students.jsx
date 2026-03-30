import { useState, useEffect } from 'react'
import { getAllGroupSections, getStudents, addStudent, updateStudent, deleteStudent, saveStudents } from '../services/students'

export default function Students() {
  const [groups, setGroups] = useState([])
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [students, setStudents] = useState([])
  const [sha, setSha] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  // Add single student
  const [newName, setNewName] = useState('')
  // Add group
  const [newGroup, setNewGroup] = useState('')
  const [newSection, setNewSection] = useState('')
  // Edit
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  // Bulk import
  const [bulkText, setBulkText] = useState('')
  const [showBulk, setShowBulk] = useState(false)
  // New group form
  const [showNewGroup, setShowNewGroup] = useState(false)

  useEffect(() => { loadGroups() }, [])

  async function loadGroups() {
    const gs = await getAllGroupSections()
    setGroups(gs)
  }

  async function loadStudents() {
    if (!selectedGroup || !selectedSection) return
    setLoading(true)
    setMsg(null)
    try {
      const result = await getStudents(selectedGroup, selectedSection)
      setStudents(result.data)
      setSha(result.sha)
    } catch (e) {
      setMsg({ type: 'error', text: 'فشل التحميل: ' + e.message })
    }
    setLoading(false)
  }

  useEffect(() => { if (selectedGroup && selectedSection) loadStudents() }, [selectedGroup, selectedSection])

  const uniqueGroups = [...new Set(groups.map(g => g.group))]
  const sections = groups.filter(g => g.group === selectedGroup).map(g => g.section)

  async function handleAddStudent() {
    if (!newName.trim()) return
    setSaving(true)
    setMsg(null)
    try {
      const result = await addStudent(selectedGroup, selectedSection, { name: newName.trim() })
      setStudents(prev => [...prev, result.student])
      setSha(result.result.content.sha)
      setNewName('')
      setMsg({ type: 'success', text: 'تمت إضافة الطالب' })
    } catch (e) {
      setMsg({ type: 'error', text: 'فشل الإضافة: ' + e.message })
    }
    setSaving(false)
  }

  async function handleBulkImport() {
    const names = bulkText.split('\n').map(n => n.trim()).filter(Boolean)
    if (names.length === 0) return
    setSaving(true)
    setMsg(null)
    try {
      const { data: existing, sha: existingSha } = await getStudents(selectedGroup, selectedSection)
      const newStudents = names.map(name => ({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        name,
        group: selectedGroup,
        section: selectedSection,
        createdAt: new Date().toISOString(),
      }))
      const all = [...existing, ...newStudents]
      const res = await saveStudents(selectedGroup, selectedSection, all, existingSha)
      setStudents(all)
      setSha(res.content.sha)
      setBulkText('')
      setShowBulk(false)
      setMsg({ type: 'success', text: `تمت إضافة ${names.length} طالب` })
    } catch (e) {
      setMsg({ type: 'error', text: 'فشل الاستيراد: ' + e.message })
    }
    setSaving(false)
  }

  async function handleCreateNewGroup() {
    if (!newGroup.trim() || !newSection.trim()) return
    setSaving(true)
    try {
      const { writeFile, studentsPath } = await import('../services/githubApi')
      await writeFile(studentsPath(newGroup.trim(), newSection.trim()), [], null, `إنشاء مجموعة ${newGroup} - ${newSection}`)
      await loadGroups()
      setSelectedGroup(newGroup.trim())
      setSelectedSection(newSection.trim())
      setNewGroup('')
      setNewSection('')
      setShowNewGroup(false)
      setMsg({ type: 'success', text: 'تم إنشاء المجموعة والشعبة' })
    } catch (e) {
      setMsg({ type: 'error', text: 'فشل: ' + e.message })
    }
    setSaving(false)
  }

  async function handleEdit(id, name) {
    setSaving(true)
    try {
      await updateStudent(selectedGroup, selectedSection, id, { name })
      setStudents(prev => prev.map(s => s.id === id ? { ...s, name } : s))
      setEditId(null)
      setMsg({ type: 'success', text: 'تم التعديل' })
    } catch (e) {
      setMsg({ type: 'error', text: 'فشل التعديل: ' + e.message })
    }
    setSaving(false)
  }

  async function handleDelete(id, name) {
    if (!confirm(`هل تريد حذف الطالب "${name}"؟`)) return
    setSaving(true)
    try {
      await deleteStudent(selectedGroup, selectedSection, id)
      setStudents(prev => prev.filter(s => s.id !== id))
      setMsg({ type: 'success', text: 'تم حذف الطالب' })
    } catch (e) {
      setMsg({ type: 'error', text: 'فشل الحذف: ' + e.message })
    }
    setSaving(false)
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة الطلاب</h1>
        <button onClick={() => setShowNewGroup(!showNewGroup)} className="btn-primary text-sm">
          ➕ مجموعة جديدة
        </button>
      </div>

      {/* New group form */}
      {showNewGroup && (
        <div className="card mb-5 border-2 border-primary-200 bg-primary-50">
          <h3 className="font-bold text-gray-700 mb-3">إنشاء مجموعة وشعبة جديدة</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">اسم المجموعة</label>
              <input className="input-field" placeholder="مثال: الخامس" value={newGroup} onChange={e => setNewGroup(e.target.value)} />
            </div>
            <div>
              <label className="label">الشعبة</label>
              <input className="input-field" placeholder="مثال: أ" value={newSection} onChange={e => setNewSection(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 mt-3">
            <button onClick={handleCreateNewGroup} disabled={saving} className="btn-primary text-sm">إنشاء</button>
            <button onClick={() => setShowNewGroup(false)} className="btn-secondary text-sm">إلغاء</button>
          </div>
        </div>
      )}

      {/* Select group */}
      <div className="card mb-5">
        <h2 className="font-bold text-gray-700 mb-3">اختر المجموعة والشعبة</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">المجموعة</label>
            <select className="input-field" value={selectedGroup} onChange={e => { setSelectedGroup(e.target.value); setSelectedSection(''); setStudents([]) }}>
              <option value="">-- اختر --</option>
              {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label">الشعبة</label>
            <select className="input-field" value={selectedSection} onChange={e => setSelectedSection(e.target.value)} disabled={!selectedGroup}>
              <option value="">-- اختر --</option>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Students list */}
      {selectedGroup && selectedSection && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-700">طلاب: {selectedGroup} / {selectedSection}</h2>
            <div className="flex gap-2">
              <span className="text-sm text-gray-500">{students.length} طالب</span>
              <button onClick={() => setShowBulk(!showBulk)} className="text-sm text-primary-600 hover:underline">استيراد جماعي</button>
            </div>
          </div>

          {/* Bulk import */}
          {showBulk && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700 mb-2 font-medium">أدخل أسماء الطلاب (اسم في كل سطر)</p>
              <textarea
                className="input-field h-32 text-sm"
                placeholder="أحمد محمد&#10;سالم علي&#10;خالد عمر"
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
              />
              <div className="flex gap-2 mt-2">
                <button onClick={handleBulkImport} disabled={saving} className="btn-primary text-sm">استيراد</button>
                <button onClick={() => setShowBulk(false)} className="btn-secondary text-sm">إلغاء</button>
              </div>
            </div>
          )}

          {/* Add single */}
          <div className="flex gap-2 mb-4">
            <input
              className="input-field flex-1"
              placeholder="اسم الطالب الجديد"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddStudent()}
            />
            <button onClick={handleAddStudent} disabled={saving || !newName.trim()} className="btn-primary px-5">إضافة</button>
          </div>

          {msg && (
            <div className={`rounded-lg p-3 mb-3 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
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
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  {editId === s.id ? (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-gray-400 text-sm w-6">{i + 1}</span>
                        <input
                          className="input-field flex-1 py-1"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2 mr-2">
                        <button onClick={() => handleEdit(s.id, editName)} disabled={saving} className="btn-success text-xs py-1 px-3">حفظ</button>
                        <button onClick={() => setEditId(null)} className="btn-secondary text-xs py-1 px-3">إلغاء</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm w-6">{i + 1}</span>
                        <span className="font-medium text-gray-800">{s.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditId(s.id); setEditName(s.name) }} className="text-xs text-primary-600 hover:underline">تعديل</button>
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
