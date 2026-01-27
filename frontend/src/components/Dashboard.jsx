import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { Box, Flex, VStack, HStack, Text, Button, SimpleGrid } from '@chakra-ui/react'
import { ArrowLeft, Download, Trash2, Image as ImageIcon, Share2, Check, FolderOpen, HardDrive, User, Images } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://imageprocessor-zypx.onrender.com'
const API_URL = `${BASE_URL}/api/image`
const SAVE_LIMIT = 3

function Gallery() {
    const { user, logout, setCurrentPage } = useAuth()
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)
    const [copiedId, setCopiedId] = useState(null)

    const userId = user?._id || user?.id

    useEffect(() => {
        if (userId) fetchImages()
    }, [userId])

    const fetchImages = async () => {
        try {
            const res = await fetch(`${API_URL}/gallery/${userId}`)
            const data = await res.json()
            setImages(data.images || [])
        } catch (err) {
            console.error('Failed to load images')
        }
        setLoading(false)
    }

    const handleDelete = async (imageId) => {
        setDeleting(imageId)
        try {
            const res = await fetch(`${API_URL}/gallery/${imageId}`, { method: 'DELETE' })
            if (res.ok) setImages(images.filter(img => img._id !== imageId))
        } catch (err) {
            console.error('Delete failed')
        }
        setDeleting(null)
    }

    const handleShare = async (imageId) => {
        const shareUrl = `${API_URL}/public/${imageId}`
        await navigator.clipboard.writeText(shareUrl)
        setCopiedId(imageId)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B'
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    const totalStorage = images.reduce((sum, img) => sum + (img.size || 0), 0)
    const savesRemaining = SAVE_LIMIT - images.length

    return (
        <Box minH="100vh" bg="#000" display="flex" flexDir="column">
            <Flex justify="space-between" align="center" px={5} h="56px" bg="#0a0a0a" borderBottom="1px solid #1a1a1a">
                <HStack gap={3}>
                    <Images size={20} color="white" />
                    <Text fontSize="md" color="white" fontWeight="600">Gallery</Text>
                    <Text fontSize="xs" color="#555">{images.length} / {SAVE_LIMIT} saves</Text>
                </HStack>
                <HStack gap={3}>
                    <Button size="sm" bg="white" color="black" h="36px" onClick={() => setCurrentPage('processor')}>
                        <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Back to Editor
                    </Button>
                    <Button size="sm" bg="#151515" color="#888" border="1px solid #2a2a2a" h="36px" onClick={logout}>Logout</Button>
                </HStack>
            </Flex>

            <Flex flex={1} overflow="hidden" direction={{ base: 'column', lg: 'row' }}>

                <Box w={{ base: '100%', lg: '320px' }} bg="#050505" borderRight={{ base: 'none', lg: '1px solid #1a1a1a' }} borderBottom={{ base: '1px solid #1a1a1a', lg: 'none' }} p={8} overflowY="auto">

                    <HStack align="center" gap={4} mb={8}>
                        <Box p={3} bg="#111" borderRadius="full" border="1px solid #222" flexShrink={0}>
                            <User size={24} color="#fff" />
                        </Box>
                        <VStack align="start" gap={0} overflow="hidden">
                            <Text color="white" fontSize="xl" fontWeight="700" noOfLines={1} w="full">{user?.name || 'User'}</Text>
                            <Text color="#666" fontSize="sm" noOfLines={1} w="full">{user?.email}</Text>
                        </VStack>
                    </HStack>

                    <Box h="1px" bg="#1a1a1a" w="full" mb={8} />

                    <Text color="#555" fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="1px" mb={5}>Usage Statistics</Text>

                    <VStack gap={6} align="stretch">
                        <Box>
                            <Flex justify="space-between" mb={2}>
                                <Text color="#ccc" fontSize="sm">Saved Images</Text>
                                <Text color="white" fontWeight="600" fontSize="sm">{images.length} / {SAVE_LIMIT}</Text>
                            </Flex>
                            <Box w="full" h="6px" bg="#151515" borderRadius="full" overflow="hidden">
                                <Box h="full" bg={savesRemaining === 0 ? '#ff5555' : '#4a4'} w={`${(images.length / SAVE_LIMIT) * 100}%`} transition="width 0.5s ease" />
                            </Box>
                            <Text color="#555" fontSize="xs" mt={2}>{savesRemaining} saves remaining on free plan</Text>
                        </Box>

                        <Box bg="#0a0a0a" p={4} borderRadius="lg" border="1px solid #1a1a1a">
                            <HStack justify="space-between">
                                <HStack gap={3}>
                                    <HardDrive size={18} color="#666" />
                                    <VStack align="start" gap={0}>
                                        <Text color="#aaa" fontSize="sm" fontWeight="500">Storage Used</Text>
                                    </VStack>
                                </HStack>
                                <Text color="white" fontWeight="600" fontSize="lg">{formatBytes(totalStorage)}</Text>
                            </HStack>
                        </Box>
                    </VStack>
                </Box>

                <Box flex={1} bg="#000" overflowY="auto" p={6}>
                    <Text color="white" fontSize="lg" fontWeight="600" mb={6}>Your Collection ({images.length})</Text>

                    {loading ? (
                        <Flex justify="center" py={16}><Text color="#555">Loading...</Text></Flex>
                    ) : images.length === 0 ? (
                        <Flex direction="column" align="center" justify="center" h="calc(100vh - 180px)" bg="#0a0a0a" border="1px dashed #1a1a1a" borderRadius="xl">
                            <Box bg="#111" p={5} borderRadius="xl" mb={4}><ImageIcon size={32} color="#333" /></Box>
                            <Text color="#555" fontSize="sm" mb={1}>No saved images yet</Text>
                            <Text color="#444" fontSize="xs" mb={5}>Your saved work will appear here</Text>
                            <Button size="sm" bg="white" color="black" onClick={() => setCurrentPage('processor')}>Create New</Button>
                        </Flex>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, xl: 3, '2xl': 4 }} gap={4}>
                            {images.map((img) => (
                                <Box key={img._id} bg="#0a0a0a" border="1px solid #1a1a1a" borderRadius="lg" overflow="hidden" _hover={{ borderColor: '#333' }} transition="0.2s">
                                    <Box h="160px" bg="#050505" display="flex" alignItems="center" justifyContent="center" p={4} position="relative" group>
                                        <img src={`${BASE_URL}${img.path}`} alt={img.originalName} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                    </Box>
                                    <Box p={4} borderTop="1px solid #1a1a1a">
                                        <Flex justify="space-between" align="start" mb={3}>
                                            <VStack align="start" gap={0} w="full">
                                                <Text fontSize="sm" color="white" fontWeight="600" noOfLines={1} title={img.originalName}>{img.originalName}</Text>
                                                <Text fontSize="xs" color="#555">{img.width} × {img.height}</Text>
                                            </VStack>
                                        </Flex>

                                        <HStack justify="space-between" mb={4}>
                                            <VStack align="start" gap={0}>
                                                <Text fontSize="10px" color="#444" textTransform="uppercase" fontWeight="bold">Size</Text>
                                                <Text fontSize="xs" color="#888">{formatBytes(img.size)}</Text>
                                            </VStack>
                                            <VStack align="end" gap={0}>
                                                <Text fontSize="10px" color="#444" textTransform="uppercase" fontWeight="bold">Created</Text>
                                                <Text fontSize="xs" color="#888">{new Date(img.createdAt).toLocaleDateString()}</Text>
                                            </VStack>
                                        </HStack>

                                        <HStack gap={2}>
                                            <Button flex={1} size="xs" bg={copiedId === img._id ? '#1a2e1a' : '#1a1a1a'} color={copiedId === img._id ? '#4ade80' : 'white'} border="1px solid" borderColor={copiedId === img._id ? '#4ade80' : '#2a2a2a'} h="28px" onClick={() => handleShare(img._id)}>
                                                {copiedId === img._id ? <><Check size={12} style={{ marginRight: '4px' }} /> Copied</> : <Share2 size={12} />}
                                            </Button>
                                            <Button size="xs" bg="#1a1a1a" color="white" border="1px solid #2a2a2a" h="28px" w="28px" p={0} onClick={() => window.open(`${BASE_URL}${img.path}`, '_blank')}><Download size={12} /></Button>
                                            <Button size="xs" bg="#1a0a0a" color="#ff5555" border="1px solid #330000" h="28px" w="28px" p={0} onClick={() => handleDelete(img._id)} isLoading={deleting === img._id}><Trash2 size={12} /></Button>
                                        </HStack>
                                    </Box>
                                </Box>
                            ))}
                        </SimpleGrid>
                    )}
                </Box>
            </Flex>
        </Box>
    )
}

export default Gallery
