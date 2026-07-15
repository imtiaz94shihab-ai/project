const API_BASE = '/api'

const request = async (endpoint, options = {}) => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

// Auth
export const customerLogin = (phone, name) => 
  request('/auth/customer', { method: 'POST', body: JSON.stringify({ phone, name }) })

export const technicianLogin = (phone) => 
  request('/auth/technician', { method: 'POST', body: JSON.stringify({ phone }) })

export const adminLogin = (accessCode) => 
  request('/auth/admin', { method: 'POST', body: JSON.stringify({ accessCode }) })

export const technicianApply = (data) => 
  request('/technician/apply', { method: 'POST', body: JSON.stringify(data) })

// Categories
export const getCategories = () => request('/categories')

// Technicians
export const getTechnicians = () => request('/technicians')

export const getTechniciansByCategory = (categoryId) => 
  request(`/technicians/category/${categoryId}`)

export const getTechnician = (id) => request(`/technicians/${id}`)

export const getTechnicianBookings = (id) => request(`/technicians/${id}/bookings`)

// Bookings
export const createBooking = (data) => 
  request('/bookings', { method: 'POST', body: JSON.stringify(data) })

export const getCustomerBookings = (customerId) => 
  request(`/bookings/customer/${customerId}`)

export const getBooking = (id) => request(`/bookings/${id}`)

export const updateBookingStatus = (id, data) => 
  request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) })

export const addReview = (id, rating, review) => 
  request(`/bookings/${id}/review`, { method: 'PATCH', body: JSON.stringify({ rating, review }) })

// Admin
export const getPendingTechnicians = () => request('/admin/pending-technicians')

export const updateTechnician = (id, data) => 
  request(`/admin/technician/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

export const getStats = () => request('/admin/stats')

export const getAllBookings = () => request('/admin/bookings')
