import { useState } from 'react'
import { useAuth } from '../App'
import { Box, VStack, Heading, Text, Input, Button, Link, HStack, Flex } from '@chakra-ui/react'
import { AlertCircle, Mail, Lock, Eye, EyeOff, Check, Share2, Download, Save } from 'lucide-react'

function Login({ onToggle }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!email || !password) {
            setError('Please fill in all fields')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            login(data.user, data.token)
        } catch (err) {
            setError(err.message)
        }
        setLoading(false)
    }

    const features = [
        'Resize & Crop images',
        '8+ Photo Filters',
        'Remove Background',
        'Rotate & Convert'
    ]

    return (
        <Box minH="100vh" bg="#000" display="flex" alignItems="center" justifyContent="center" p={4}>
            <Flex gap={0} w="full" maxW="1100px">

                <Box flex={1} bg="#050505" p={8} borderRadius="xl 0 0 xl" border="1px solid #222" borderRight="none" display={{ base: 'none', md: 'flex' }}>
                    <VStack align="start" gap={5} justify="center">
                        <HStack gap={2}>
                            <img src="/vite.svg" style={{ width: '28px', height: '28px' }} alt="Logo" />
                            <Heading size="md" color="white">ImageProcessor</Heading>
                        </HStack>
                        <Text color="#666" fontSize="sm">Professional image editing in your browser</Text>

                        <VStack align="start" gap={2}>
                            {features.map((f, i) => (
                                <HStack key={i} gap={2}>
                                    <Check size={14} color="#4a4" />
                                    <Text color="#888" fontSize="sm">{f}</Text>
                                </HStack>
                            ))}
                        </VStack>

                        <VStack align="start" gap={2} pt={4}>
                            <HStack gap={2}><Save size={14} color="#4a4" /><Text color="#666" fontSize="xs">Save & share download links</Text></HStack>
                            <HStack gap={2}><Share2 size={14} color="#4a4" /><Text color="#666" fontSize="xs">Share with anyone</Text></HStack>
                            <HStack gap={2}><Download size={14} color="#4a4" /><Text color="#666" fontSize="xs">Unlimited downloads</Text></HStack>
                        </VStack>
                    </VStack>
                </Box>

                <Box flex={1} bg="#0a0a0a" border="1px solid #222" borderRadius={{ base: 'xl', md: '0 xl xl 0' }} p={8} display="flex" alignItems="center">
                    <VStack gap={4} as="form" onSubmit={handleSubmit} w="full">
                        <VStack gap={1}>
                            <Heading size="md" color="white">Welcome back</Heading>
                            <Text color="#666" fontSize="sm">Sign in to continue</Text>
                        </VStack>

                        {error && (
                            <HStack w="full" p={3} bg="#220000" border="1px solid #440000" borderRadius="md" color="#ff4444">
                                <AlertCircle size={16} /><Text fontSize="sm">{error}</Text>
                            </HStack>
                        )}

                        <VStack gap={3} w="full">
                            <Box position="relative" w="full">
                                <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" color="#555"><Mail size={16} /></Box>
                                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} pl={12} bg="#111" border="1px solid #333" color="white" h="44px" />
                            </Box>
                            <Box position="relative" w="full">
                                <Box position="absolute" left={4} top="50%" transform="translateY(-50%)" color="#555"><Lock size={16} /></Box>
                                <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} pl={12} pr={12} bg="#111" border="1px solid #333" color="white" h="44px" />
                                <Box position="absolute" right={4} top="50%" transform="translateY(-50%)" cursor="pointer" color="#555" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </Box>
                            </Box>
                        </VStack>

                        <Button type="submit" w="full" h="44px" bg="white" color="black" fontWeight="500" isLoading={loading}>Sign In</Button>
                        <Text color="#666" fontSize="sm">Don't have an account? <Link color="white" onClick={onToggle}>Sign up</Link></Text>
                    </VStack>
                </Box>
            </Flex>
        </Box>
    )
}

export default Login
