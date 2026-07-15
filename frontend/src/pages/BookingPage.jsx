import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getTechnician, getCategories, createBooking } from '../services/api'

const BookingPage = () => {
  const { technicianId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [technician, setTechnician] = useState(null)
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    address: '',
    problem: '',
    scheduledDate: '',
    scheduledTime: '10:00 AM'
  })

  useEffect(() => {
    getTechnician(technicianId).then(async tech => {
      setTechnician(tech)
      const cats = await getCategories()
      const cat = cats.find(c => c.id === tech.categories[0])
      setCategory(cat)
    }).finally(() => setLoading(false))
  }, [technicianId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.address || !form.problem) return
    
    setSubmitting(true)
    try {
      await createBooking({
        customerId: user.id,
        customerName: user.name,
        customerPhone: user.phone,
        technicianId: technician.id,
        technicianName: technician.name,
        categoryId: category?.id,
        categoryName: category?.name,
        address: form.address,
        problem: form.problem,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        estimatedPrice: category?.priceRange
      })
      navigate('/my-bookings')
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Book {technician?.name}</h1>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#e3f2fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            🔧
          </div>
          <div>
            <h3>{technician?.name}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              {category?.name} • ⭐ {technician?.rating} • {technician?.jobsCompleted} jobs
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Service</label>
          <div style={{
            background: '#e8f5e9',
            padding: '1rem',
            borderRadius: '8px',
            color: '#2e7d32'
          }}>
            {category?.icon} {category?.name} - {category?.priceRange}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Address *</label>
          <input
            type="text"
            placeholder="House/Flat, Road, Area, Dhaka"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            required
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Describe the Problem *</label>
          <textarea
            placeholder="What needs to be fixed or serviced?"
            value={form.problem}
            onChange={e => setForm({ ...form, problem: e.target.value })}
            required
            rows={4}
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date</label>
            <input
              type="date"
              value={form.scheduledDate}
              onChange={e => setForm({ ...form, scheduledDate: e.target.value })}
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Time</label>
            <select
              value={form.scheduledTime}
              onChange={e => setForm({ ...form, scheduledTime: e.target.value })}
              style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
            >
              <option>9:00 AM</option>
              <option>10:00 AM</option>
              <option>11:00 AM</option>
              <option>12:00 PM</option>
              <option>2:00 PM</option>
              <option>3:00 PM</option>
              <option>4:00 PM</option>
              <option>5:00 PM</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '1rem',
            background: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1
          }}
        >
          {submitting ? 'Booking...' : 'Confirm Booking'}
        </button>
      </form>
    </div>
  )
}

export default BookingPage
