import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('repairit_user')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (user) localStorage.setItem('repairit_user', JSON.stringify(user))
    else localStorage.removeItem('repairit_user')
  }, [user])

  const login = (userData) => setUser(userData)
  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
