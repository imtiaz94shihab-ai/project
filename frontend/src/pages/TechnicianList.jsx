import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTechniciansByCategory, getCategories } from '../services/api'

const TechnicianList = () => {
  const { categoryId } = useParams()
  const [technicians, setTechnicians] = useState([])
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getTechniciansByCategory(categoryId),
      getCategories()
    ]).then(([techs, cats]) => {
      setTechnicians(techs)
      setCategory(cats.find(c => c.id === categoryId))
    }).finally(() => setLoading(false))
  }, [categoryId])

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>
        {category?.icon} {category?.name} Technicians
      </h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>{category?.description}</p>

      {technicians.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px' }}>
          <p style={{ color: '#666' }}>No verified technicians available for this service yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {technicians.map(tech => (
            <div
              key={tech.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ color: '#333' }}>{tech.name}</h3>
                  {tech.verified && (
                    <span style={{
                      background: '#e8f5e9',
                      color: '#2e7d32',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{tech.bio}</p>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#555' }}>
                  <span>⭐ {tech.rating.toFixed(1)}</span>
                  <span>📋 {tech.jobsCompleted} jobs</span>
                  <span>💼 {tech.experience}</span>
                </div>
              </div>
              <Link
                to={`/book/${tech.id}`}
                style={{
                  background: '#1a73e8',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '500'
                }}
              >
                Book Now
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TechnicianList
