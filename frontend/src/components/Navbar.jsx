import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={{
      background: '#1a73e8',
      color: 'white',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
        🔧 RepairIt
      </Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontSize: '0.9rem' }}>
              {user.role === 'admin' ? '👤 Admin' : user.role === 'technician' ? '🔧 Technician' : '👤'} {user.name}
            </span>
            {user.role === 'customer' && (
              <Link to="/my-bookings" style={{ color: 'white', textDecoration: 'none' }}>My Bookings</Link>
            )}
            {user.role === 'technician' && (
              <Link to="/technician-dashboard" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Admin</Link>
            )}
            <button onClick={handleLogout} style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar
