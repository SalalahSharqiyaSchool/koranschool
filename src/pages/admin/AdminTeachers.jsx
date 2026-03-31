import { useState, useEffect } from 'react'
import { readFile, writeFile, teachersPath } from '../../services/githubApi'
import { hashPassword } from '../../services/auth'

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([])
  const [sha, setSha] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newTeacher, setNewTeacher] = useState({ username: '', name: '', password: '', role: 'teacher' })
  const [editId, setEditId] = useState(null)
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => { loadTeachers() }, [])

  async function loadTeachers() {
    setLoading(true)
    try {
      const result = await readFile(teachersPath)
      if (result) { setTeachers(result.data); setSha(result.sha) }
    } catch (e) { setMsg({ type: 'error', text: 'فشل التحميل' }) }
    setLoading(false)
  }

  function showMsg(type, text) { setMsg({ type, text }); setTimeout(() => setMsg(null), 3000) }

  async function handleAdd() {
    if (!newTeacher.username || !newTeacher.name || !newTeacher.password) return showMsg('error', 'يرجى تعبئة جميع الحقول')
    if (teachers.find(t => t.username === newTeacher.username)) return showMsg('error', 'اسم المستخدم موجود مسبقاً')
    setSaving(true)
    try {
      const hashed = await hashPassword(newTeacher.password)
      const updated = [...teachers, { username: newTeacher.username, name: newTeacher.name, password: hashed, role: newTeacher.role }]
      const res = await writeFile(teachersPath, updated, sha, 'إضافة معلم جديد')
      setTeachers(updated)
      setSha(res.content.sha)
      setNewTeacher({ username: '', name: '', password: '', role: 'teacher' })
      setShowAdd(false)
      showMsg('success', 'تمت إضافة المعلم ✅')
    } catch (e) { showMsg('error', 'فشل: ' + e.message) }
    setSaving(false)
  }

  async function handleChangePassword(username) {
    if (!newPassword) return showMsg('error', 'أدخل كلمة المرور الجديدة')
    setSaving(true)
    try {
      const hashed = await hashPassword(newPassword)
      const updated = teachers.map(t => t.username === username ? { ...t, password: hashed } : t)
      const res = await writeFile(teachersPath, updated, sha, `تغيير كلمة مرور ${username}`)
      setTeachers(updated)
      setSha(res.content.sha)
      setEditId(null)
      setNewPassword('')
      showMsg('success', 'تم تغيير كلمة المرور ✅')
    } catch (e) { showMsg('error', 'فشل: ' + e.message) }
    setSaving(false)
  }

  async function handleDelete(username) {
    if (!confirm(`حذف المعلم "${username}"؟`)) return
    setSaving(true)
    try {
      const updated = teachers.filter(t => t.username !== username)
      const res = await writeFile(teachersPath, updated, sha, `حذف المعلم ${username}`)
      setTeachers(updated)
      setSha(res.content.sha)
      showMsg('success', 'تم الحذف')
    } catch (e) { showMsg('error', 'فشل: ' + e.message) }
    setSaving(false)
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">إدارة المعلمين</h1>
        <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm">➕ إضافة معلم</button>
      </div>

      {showAdd && (
        <div className="card mb-5 border-2 border-blue-100 bg-blue-50">
          <h3 className="font-bold text-gray-700 mb-4">معلم جديد</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">اسم المستخدم</label>
              <input className="input-field" placeholder="teacher3" value={newTeacher.username} onChange={e => setNewTeacher({...newTeacher, username: e.target.value})} />
            </div>
            <div>
              <label className="label">الاسم الكامل</label>
              <input className="input-field" placeholder="اسم المعلم" value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} />
            </div>
            <div>
              <label className="label">كلمة المرور</label>
              <input type="password" className="input-field" placeholder="••••••" value={newTeacher.password} onChange={e => setNewTeacher({...newTeacher, password: e.target.value})} />
            </div>
            <div>
              <label className="label">الدور</label>
              <select className="input-field" value={newTeacher.role} onChange={e => setNewTeacher({...newTeacher, role: e.target.value})}>
                <option value="teacher">معلم</option>
                <option value="admin">مدير</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleAdd} disabled={saving} className="btn-primary text-sm">إضافة</button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm">إلغاء</button>
          </div>
        </div>
      )}

      {msg && (
        <div className={`rounded-lg p-3 mb-4 text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="text-center py-8 text-gray-400">جارٍ التحميل...</div>
        ) : (
          <div className="space-y-3">
            {teachers.map(t => (
              <div key={t.username} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${t.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{t.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono">{t.username}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'}`}>
                          {t.role === 'admin' ? 'مدير' : 'معلم'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditId(editId === t.username ? null : t.username); setNewPassword('') }}
                      className="text-xs text-blue-600 hover:underline">تغيير كلمة المرور</button>
                    {t.role !== 'admin' && (
                      <button onClick={() => handleDelete(t.username)} className="text-xs text-red-500 hover:underline">حذف</button>
                    )}
                  </div>
                </div>
                {editId === t.username && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                    <input type="password" className="input-field flex-1 py-1 text-sm" placeholder="كلمة المرور الجديدة"
                      value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <button onClick={() => handleChangePassword(t.username)} disabled={saving} className="btn-primary text-sm px-4">حفظ</button>
                    <button onClick={() => setEditId(null)} className="btn-secondary text-sm px-3">إلغاء</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
