import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { customerLogin, technicianLogin, adminLogin, technicianApply } from '../services/api'

const Login = () => {
  const [tab, setTab] = useState('customer')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [experience, setExperience] = useState('')
  const [bio, setBio] = useState('')
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const SERVICE_CATEGORIES = [
    { id: 'cat-1', name: 'Plumbing' },
    { id: 'cat-2', name: 'Electrical' },
    { id: 'cat-3', name: 'AC Repair' },
    { id: 'cat-4', name: 'Painting' },
    { id: 'cat-5', name: 'Carpentry' },
    { id: 'cat-6', name: 'Appliance Repair' },
    { id: 'cat-7', name: 'Cleaning' },
    { id: 'cat-8', name: 'Civil Work' }
  ]

  const handleCustomerLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await customerLogin(phone, name)
      login(user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleTechnicianLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await technicianLogin(phone)
      login(user)
      navigate('/technician-dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleTechnicianApply = async (e) => {
    e.preventDefault()
    setError('')
    if (!phone || !name || !experience || categories.length === 0) {
      setError('All fields required')
      return
    }
    try {
      await technicianApply({ phone, name, categories, experience, bio })
      setSuccess('Application submitted! Await admin approval.')
      setPhone(''); setName(''); setExperience(''); setBio(''); setCategories([])
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAdminLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const user = await adminLogin(accessCode)
      login(user)
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleCategory = (id) => {
    setCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Login to RepairIt</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['customer', 'technician', 'admin'].map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(''); setSuccess('') }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: tab === t ? '#1a73e8' : '#e0e0e0',
              color: tab === t ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

      {tab === 'customer' && (
        <form onSubmit={handleCustomerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="tel"
            placeholder="Phone Number (e.g., 01712345678)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
          />
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
          />
          <button type="submit" style={{
            padding: '1rem',
            background: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}>Login as Customer</button>
        </form>
      )}

      {tab === 'technician' && (
        <>
          <form onSubmit={handleTechnicianLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
            <button type="submit" style={{
              padding: '1rem',
              background: '#1a73e8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}>Login as Technician</button>
          </form>
          <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #ddd' }} />
          <h3 style={{ marginBottom: '1rem' }}>New Technician? Apply Here</h3>
          <form onSubmit={handleTechnicianApply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
            <input
              type="text"
              placeholder="Years of Experience"
              value={experience}
              onChange={e => setExperience(e.target.value)}
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
            <textarea
              placeholder="Short Bio (optional)"
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', resize: 'vertical' }}
            />
            <div>
              <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Services Offered:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {SERVICE_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: categories.includes(cat.id) ? '#1a73e8' : '#e0e0e0',
                      color: categories.includes(cat.id) ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" style={{
              padding: '1rem',
              background: '#34a853',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}>Submit Application</button>
          </form>
        </>
      )}

      {tab === 'admin' && (
        <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="password"
            placeholder="Admin Access Code"
            value={accessCode}
            onChange={e => setAccessCode(e.target.value)}
            style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
          />
          <button type="submit" style={{
            padding: '1rem',
            background: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}>Login as Admin</button>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
            Demo code: admin123
          </p>
        </form>
      )}
    </div>
  )
}

export default Login
