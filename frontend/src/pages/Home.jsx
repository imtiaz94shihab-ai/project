import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCategories } from '../services/api'

const Home = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories().then(setCategories).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#333' }}>
          Home Repair Services in Dhaka
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Book verified technicians for plumbing, electrical, AC repair and more
        </p>
      </div>

      <h2 style={{ marginBottom: '1.5rem', color: '#333' }}>Our Services</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1.5rem'
      }}>
        {categories.map(cat => (
          <Link
            key={cat.id}
            to={`/technicians/${cat.id}`}
            style={{
              textDecoration: 'none',
              background: 'white',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{cat.icon}</div>
            <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>{cat.name}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{cat.description}</p>
            <p style={{ color: '#1a73e8', fontSize: '0.85rem', fontWeight: '500' }}>
              {cat.priceRange}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
