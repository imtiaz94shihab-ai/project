import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCustomerBookings, addReview } from '../services/api'

const STATUS_COLORS = {
  requested: '#fff3e0',
  accepted: '#e3f2fd',
  en_route: '#fce4ec',
  in_progress: '#fff8e1',
  completed: '#e8f5e9',
  cancelled: '#ffebee'
}

const STATUS_TEXT_COLORS = {
  requested: '#e65100',
  accepted: '#1565c0',
  en_route: '#c62828',
  in_progress: '#f57f17',
  completed: '#2e7d32',
  cancelled: '#c62828'
}

const MyBookings = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: '' })
  const [reviewingBooking, setReviewingBooking] = useState(null)

  useEffect(() => {
    loadBookings()
  }, [user])

  const loadBookings = () => {
    getCustomerBookings(user.id)
      .then(setBookings)
      .finally(() => setLoading(false))
  }

  const handleReview = async (bookingId) => {
    try {
      await addReview(bookingId, reviewForm.rating, reviewForm.review)
      setReviewingBooking(null)
      loadBookings()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Bookings</h1>

      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px' }}>
          <p style={{ color: '#666' }}>No bookings yet. Book a technician to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map(booking => (
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
                  <h3 style={{ marginBottom: '0.25rem' }}>{booking.categoryName}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>with {booking.technicianName}</p>
                </div>
                <span style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  background: STATUS_COLORS[booking.status],
                  color: STATUS_TEXT_COLORS[booking.status],
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {booking.status.replace('_', ' ')}
                </span>
              </div>

              <p style={{ color: '#555', marginBottom: '0.75rem' }}>📍 {booking.address}</p>
              <p style={{ color: '#555', marginBottom: '0.75rem' }}>📝 {booking.problem}</p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                📅 {booking.scheduledDate} at {booking.scheduledTime}
              </p>

              {booking.finalPrice && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                  <p style={{ fontWeight: '500' }}>Final Price: {booking.finalPrice}</p>
                  {booking.priceBreakdown && (
                    <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                      Labor: {booking.priceBreakdown.labor} | Parts: {booking.priceBreakdown.parts} | Visit: {booking.priceBreakdown.visit}
                    </p>
                  )}
                </div>
              )}

              {booking.status === 'completed' && !booking.rating && reviewingBooking !== booking.id && (
                <button
                  onClick={() => setReviewingBooking(booking.id)}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: '#1a73e8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Leave Review
                </button>
              )}

              {reviewingBooking === booking.id && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '0.75rem' }}>Rate your experience</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '1.5rem',
                          cursor: 'pointer',
                          opacity: star <= reviewForm.rating ? 1 : 0.3
                        }}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                  <textarea
                    placeholder="Write a review..."
                    value={reviewForm.review}
                    onChange={e => setReviewForm({ ...reviewForm, review: e.target.value })}
                    rows={3}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical', marginBottom: '0.75rem' }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleReview(booking.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#1a73e8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => setReviewingBooking(null)}
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

              {booking.rating && (
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{'⭐'.repeat(booking.rating)}</span>
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>{booking.review}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBookings
