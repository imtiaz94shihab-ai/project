import { useState, useEffect } from 'react'
import { getStats, getPendingTechnicians, updateTechnician, getAllBookings } from '../services/api'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    Promise.all([getStats(), getPendingTechnicians(), getAllBookings()])
      .then(([s, p, b]) => {
        setStats(s)
        setPending(p)
        setBookings(b)
      })
      .finally(() => setLoading(false))
  }

  const handleApproval = async (techId, status) => {
    try {
      await updateTechnician(techId, { status, verified: status === 'approved' })
      loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>📊 Admin Dashboard</h1>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Customers', value: stats?.totalCustomers, icon: '👤' },
          { label: 'Technicians', value: stats?.totalTechnicians, icon: '🔧' },
          { label: 'Total Bookings', value: stats?.totalBookings, icon: '📋' },
          { label: 'Completed', value: stats?.completedBookings, icon: '✅' },
          { label: 'Pending Apps', value: stats?.pendingApplications, icon: '⏳' },
          { label: 'Avg Rating', value: stats?.avgRating?.toFixed(1), icon: '⭐' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#333' }}>{stat.value}</div>
            <div style={{ color: '#666', fontSize: '0.9rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Applications */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Pending Applications ({pending.length})</h2>
        {pending.length === 0 ? (
          <p style={{ color: '#666', padding: '1rem', background: 'white', borderRadius: '8px' }}>No pending applications</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pending.map(tech => (
              <div
                key={tech.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3>{tech.name}</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>📞 {tech.phone}</p>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>💼 {tech.experience}</p>
                    <p style={{ color: '#555', marginTop: '0.5rem' }}>{tech.bio}</p>
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {tech.categories.map(cat => (
                        <span key={cat} style={{
                          background: '#e3f2fd',
                          color: '#1565c0',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem'
                        }}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleApproval(tech.id, 'approved')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#34a853',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(tech.id, 'rejected')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#c62828',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div>
        <h2 style={{ marginBottom: '1rem' }}>Recent Bookings</h2>
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Technician</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Service</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 10).map(booking => (
                <tr key={booking.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '1rem' }}>{booking.customerName}</td>
                  <td style={{ padding: '1rem' }}>{booking.technicianName}</td>
                  <td style={{ padding: '1rem' }}>{booking.categoryName}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{booking.status.replace('_', ' ')}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{booking.finalPrice || booking.estimatedPrice || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
