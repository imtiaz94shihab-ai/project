import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import TechnicianList from './pages/TechnicianList'
import BookingPage from './pages/BookingPage'
import MyBookings from './pages/MyBookings'
import TechnicianDashboard from './pages/TechnicianDashboard'
import AdminDashboard from './pages/AdminDashboard'

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />
  return children
}

function App() {
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/technicians/:categoryId" element={<TechnicianList />} />
        <Route path="/book/:technicianId" element={
          <ProtectedRoute><BookingPage /></ProtectedRoute>
        } />
        <Route path="/my-bookings" element={
          <ProtectedRoute roles={['customer']}><MyBookings /></ProtectedRoute>
        } />
        <Route path="/technician-dashboard" element={
          <ProtectedRoute roles={['technician']}><TechnicianDashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App
