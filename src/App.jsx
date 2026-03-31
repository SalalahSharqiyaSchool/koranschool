import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Setup from './pages/Setup'
import TeacherLayout from './pages/teacher/TeacherLayout'
import TeacherAttendance from './pages/teacher/TeacherAttendance'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAttendance from './pages/admin/AdminAttendance'
import AdminReports from './pages/admin/AdminReports'
import AdminStudents from './pages/admin/AdminStudents'
import AdminTeachers from './pages/admin/AdminTeachers'

function Spinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"/>
    </div>
  )
}

function RoleRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/teacher'} replace />
  return children
}

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/teacher'} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<Setup />} />

          {/* Teacher routes */}
          <Route path="/teacher" element={<RoleRoute role="teacher"><TeacherLayout /></RoleRoute>}>
            <Route index element={<TeacherAttendance />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<RoleRoute role="admin"><AdminLayout /></RoleRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="teachers" element={<AdminTeachers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
