import { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Spinner, Center, Box } from '@chakra-ui/react'
import Login from './components/Login'
import Signup from './components/Signup'
import Gallery from './components/Dashboard'
import ImageProcessor from './components/ImageProcessor'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function AuthContainer() {
  const { user } = useAuth()
  const [isLogin, setIsLogin] = useState(true)

  if (user) return <Navigate to="/" replace />

  return isLogin ? (
    <Login onToggle={() => setIsLogin(false)} />
  ) : (
    <Signup onToggle={() => setIsLogin(true)} />
  )
}

function MainContainer() {
  const { user, currentPage } = useAuth()
  
  if (!user) return <Navigate to="/auth" replace />

  return currentPage === 'gallery' ? <Gallery /> : <ImageProcessor />
}

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('processor')
  const navigate = useNavigate()

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false)
        return
      }
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://imageprocessor-zypx.onrender.com'}/api/auth/verify`, {
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
    navigate('/')
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    navigate('/auth')
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
        <Routes>
          <Route path="/auth" element={<AuthContainer />} />
          <Route path="/" element={<MainContainer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </AuthContext.Provider>
  )
}

export default App
