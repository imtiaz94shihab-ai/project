import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getTechnicianBookings, updateBookingStatus } from '../services/api'

const STATUS_COLORS = {
  requested: '#fff3e0',
  accepted: '#e3f2fd',
  en_route: '#fce4ec',
  in_progress: '#fff8e1',
  completed: '#e8f5e9',
  cancelled: '#ffebee'
}

const NEXT_STATUS = {
  requested: 'accepted',
  accepted: 'en_route',
  en_route: 'in_progress',
  in_progress: 'completed'
}

const TechnicianDashboard = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [finalizing, setFinalizing] = useState(null)
  const [finalPrice, setFinalPrice] = useState({ labor: '', parts: '', visit: '' })

  useEffect(() => {
    loadBookings()
  }, [user])

  const loadBookings = () => {
    getTechnicianBookings(user.id)
      .then(setBookings)
      .finally(() => setLoading(false))
  }

  const updateStatus = async (bookingId, status, extraData = {}) => {
    try {
      await updateBookingStatus(bookingId, { status, ...extraData })
      loadBookings()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleFinalize = async (bookingId) => {
    const labor = finalPrice.labor || '৳0'
    const parts = finalPrice.parts || '৳0'
    const visit = finalPrice.visit || '৳0'
    const total = `৳${parseInt(labor.replace('৳','')) + parseInt(parts.replace('৳','')) + parseInt(visit.replace('৳',''))}`
    await updateStatus(bookingId, 'completed', { finalPrice: total, priceBreakdown: { labor, parts, visit } })
    setFinalizing(null)
    setFinalPrice({ labor: '', parts: '', visit: '' })
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>

  const activeBookings = bookings.filter(b => !['completed', 'cancelled'].includes(b.status))
  const completedBookings = bookings.filter(b => ['completed', 'cancelled'].includes(b.status))

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>🔧 Technician Dashboard</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Active Jobs ({activeBookings.length})</h2>
        {activeBookings.length === 0 ? (
          <p style={{ color: '#666', padding: '1rem' }}>No active jobs</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeBookings.map(booking => (
              <div
                key={booking.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3>{booking.customerName}</h3>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>📞 {booking.customerPhone}</p>
                  </div>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    background: STATUS_COLORS[booking.status],
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>

                <p style={{ color: '#555', marginBottom: '0.5rem' }}>📍 {booking.address}</p>
                <p style={{ color: '#555', marginBottom: '0.5rem' }}>📝 {booking.problem}</p>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>📅 {booking.scheduledDate} at {booking.scheduledTime}</p>

                {booking.status === 'in_progress' && finalizing !== booking.id && (
                  <button
                    onClick={() => setFinalizing(booking.id)}
                    style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1.5rem',
                      background: '#34a853',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Complete & Set Price
                  </button>
                )}

                {finalizing === booking.id && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '0.75rem' }}>Enter Price Breakdown</h4>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Labor (e.g., ৳500)"
                        value={finalPrice.labor}
                        onChange={e => setFinalPrice({ ...finalPrice, labor: e.target.value })}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                      />
                      <input
                        type="text"
                        placeholder="Parts (e.g., ৳200)"
                        value={finalPrice.parts}
                        onChange={e => setFinalPrice({ ...finalPrice, parts: e.target.value })}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                      />
                      <input
                        type="text"
                        placeholder="Visit (e.g., ৳100)"
                        value={finalPrice.visit}
                        onChange={e => setFinalPrice({ ...finalPrice, visit: e.target.value })}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleFinalize(booking.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#34a853',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Confirm Completion
                      </button>
                      <button
                        onClick={() => setFinalizing(null)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#e0e0e0',
                          color: '#333',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {NEXT_STATUS[booking.status] && finalizing !== booking.id && (
                  <button
                    onClick={() => updateStatus(booking.id, NEXT_STATUS[booking.status])}
                    style={{
                      marginTop: '1rem',
                      marginRight: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      background: '#1a73e8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Mark as {NEXT_STATUS[booking.status].replace('_', ' ')}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Past Jobs ({completedBookings.length})</h2>
        {completedBookings.map(booking => (
          <div
            key={booking.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '0.75rem',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
              opacity: booking.status === 'cancelled' ? 0.6 : 1
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{booking.customerName}</strong>
                <span style={{ marginLeft: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                  {booking.categoryName}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  background: STATUS_COLORS[booking.status],
                  fontSize: '0.8rem',
                  textTransform: 'capitalize'
                }}>
                  {booking.status}
                </span>
                {booking.finalPrice && (
                  <p style={{ fontWeight: '500', marginTop: '0.25rem' }}>{booking.finalPrice}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TechnicianDashboard
