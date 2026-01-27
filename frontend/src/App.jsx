import { useState, useEffect, createContext, useContext } from 'react'
import { Spinner, Center, Box } from '@chakra-ui/react'
import Login from './components/Login'
import Signup from './components/Signup'
import Gallery from './components/Dashboard'
import ImageProcessor from './components/ImageProcessor'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('processor') // processor, gallery

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/verify`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          localStorage.removeItem('token')
          setToken(null)
        }
      } catch (error) {
        localStorage.removeItem('token')
        setToken(null)
      }
      setLoading(false)
    }
    verifyToken()
  }, [token])

  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('token', authToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  if (loading) {
    return (
      <Center h="100vh" bg="#0a0a0a">
        <Spinner size="xl" color="white" />
      </Center>
    )
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, currentPage, setCurrentPage }}>
      <Box bg="#0a0a0a" minH="100vh" color="white">
        {user ? (
          currentPage === 'gallery' ? <Gallery /> : <ImageProcessor />
        ) : isLogin ? (
          <Login onToggle={() => setIsLogin(false)} />
        ) : (
          <Signup onToggle={() => setIsLogin(true)} />
        )}
      </Box>
    </AuthContext.Provider>
  )
}

export default App
