import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../App'
import { Box, Flex, VStack, HStack, Text, Button, Input, SimpleGrid, Spinner } from '@chakra-ui/react'
import { Image, Upload, Maximize, Crop, Palette, Settings, Save, Download, RotateCcw, AlertCircle, Grid3X3, Eraser, Check, Aperture, Sliders, Images } from 'lucide-react'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://imageprocessor-zypx.onrender.com'
const API_URL = `${BASE_URL}/api/image`
const SAVE_LIMIT = 3

function ImageProcessor() {
    const { user, logout, setCurrentPage } = useAuth()
    const fileInputRef = useRef(null)

    const [uploadedImage, setUploadedImage] = useState(null)
    const [processedImage, setProcessedImage] = useState(null)
    const [activeTab, setActiveTab] = useState('resize')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [saveCount, setSaveCount] = useState(0)

    const [resizeWidth, setResizeWidth] = useState('')
    const [resizeHeight, setResizeHeight] = useState('')
    const [activeResizePreset, setActiveResizePreset] = useState(null)
    const [cropX, setCropX] = useState('')
    const [cropY, setCropY] = useState('')
    const [cropWidth, setCropWidth] = useState('')
    const [cropHeight, setCropHeight] = useState('')
    const [rotateAngle, setRotateAngle] = useState(90)
    const [convertFormat, setConvertFormat] = useState('jpeg')
    const [compressQuality, setCompressQuality] = useState(60)
    const [brightness, setBrightness] = useState(1)
    const [saturation, setSaturation] = useState(1)

    const userId = user?._id || user?.id

    // Shared styles
    const btnStyle = { bg: '#1a1a1a', color: 'white', border: '1px solid #2a2a2a', h: '36px', fontSize: 'sm' }
    const inputStyle = { bg: '#111', border: '1px solid #2a2a2a', color: 'white' }

    useEffect(() => {
        if (userId) {
            fetch(`${API_URL}/gallery/count/${userId}`)
                .then(res => res.json())
                .then(data => setSaveCount(data.count || 0))
                .catch(() => { })
        }
    }, [userId])

    // Reusable API call function
    const apiCall = async (url, body = null) => {
        setLoading(true)
        setError('')
        await new Promise(r => setTimeout(r, 50))
        try {
            const options = { method: 'POST', headers: { 'Content-Type': 'application/json' } }
            if (body) options.body = JSON.stringify(body)
            const res = await fetch(url, options)
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            setLoading(false)
            return data
        } catch (err) {
            setError(err.message)
            setLoading(false)
            return null
        }
    }

    // Reusable process handler - reduces repetition
    const processImage = async (endpoint, body = {}) => {
        if (!uploadedImage) return
        const data = await apiCall(`${API_URL}/${endpoint}/${uploadedImage.filename}`, body)
        if (data) { setProcessedImage(data.file); setSaved(false) }
    }

    // Utility functions
    const formatBytes = (bytes) => {
        if (!bytes) return '0 B'
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    }

    const getAspectRatio = (w, h) => {
        if (!w || !h) return '-'
        const gcd = (a, b) => b ? gcd(b, a % b) : a
        const divisor = gcd(w, h)
        return `${w / divisor}:${h / divisor}`
    }

    const getFormat = (filename) => filename?.split('.').pop()?.toUpperCase() || '-'

    // Reusable stat item component
    const StatItem = ({ label, value }) => (
        <VStack align="start" gap={0}>
            <Text color="#555" fontSize="xs">{label}</Text>
            <Text color="white" fontSize="xs" fontWeight="500">{value}</Text>
        </VStack>
    )

    // Reusable preset button component
    const PresetButton = ({ label, isActive, onClick }) => (
        <Button
            size="xs"
            bg={isActive ? 'white' : '#151515'}
            color={isActive ? 'black' : '#888'}
            border="1px solid #2a2a2a"
            fontWeight="normal"
            _hover={{ bg: '#222', color: 'white' }}
            onClick={onClick}
        >
            {label}
        </Button>
    )

    const handleUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 10 * 1024 * 1024) { setError('File too large (max 10MB)'); return }

        const formData = new FormData()
        formData.append('image', file)

        setLoading(true)
        await new Promise(r => setTimeout(r, 50))
        try {
            const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            setUploadedImage({ ...data.file, originalName: file.name })
            setProcessedImage(null)
            setSaved(false)
        } catch (err) {
            setError(err.message)
        }
        setLoading(false)
    }

    // Simplified handlers using processImage
    const handleResize = () => {
        if (!resizeWidth && !resizeHeight) return
        processImage('resize', { width: Number(resizeWidth) || null, height: Number(resizeHeight) || null })
    }

    const handleCrop = () => {
        if (!cropWidth || !cropHeight) return
        processImage('crop', { left: Number(cropX) || 0, top: Number(cropY) || 0, width: Number(cropWidth), height: Number(cropHeight) })
    }

    const handleFilter = (filter) => processImage('filter', { filter })
    const handleRotate = () => processImage('rotate', { angle: rotateAngle })
    const handleConvert = () => processImage('convert', { format: convertFormat, quality: compressQuality })
    const handleRemoveBg = () => processImage('remove-bg', { tolerance: 40 })
    const handleAdjust = () => processImage('adjust', { brightness, saturation })

    const handleSave = async () => {
        if (!processedImage || !userId) { setError('No image to save'); return }
        if (saveCount >= SAVE_LIMIT) { setError('Save limit reached. Delete images from Gallery.'); return }

        setSaving(true)
        try {
            const res = await fetch(`${API_URL}/save/${processedImage.filename}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, originalName: uploadedImage?.originalName || processedImage.filename })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message)
            setSaveCount(data.count)
            setSaved(true)
        } catch (err) {
            setError(err.message)
        }
        setSaving(false)
    }

    const handleDownload = () => {
        const img = processedImage || uploadedImage
        if (img) window.open(`${BASE_URL}${img.path}`, '_blank')
    }

    const handleResetEdits = () => {
        setProcessedImage(null)
        setSaved(false)
        setError('')
    }

    const resetAll = () => {
        setUploadedImage(null)
        setProcessedImage(null)
        setResizeWidth(''); setResizeHeight('')
        setCropX(''); setCropY(''); setCropWidth(''); setCropHeight('')
        setBrightness(1); setSaturation(1)
        setSaved(false)
        setError('')
    }

    const applyCropPreset = (ratio) => {
        const imgW = uploadedImage.width
        const imgH = uploadedImage.height
        const targetRatio = ratio.w / ratio.h
        const currentRatio = imgW / imgH
        let newW, newH

        if (currentRatio > targetRatio) {
            newH = imgH
            newW = imgH * targetRatio
        } else {
            newW = imgW
            newH = imgW / targetRatio
        }

        setCropWidth(Math.round(newW))
        setCropHeight(Math.round(newH))
        setCropX(Math.round((imgW - newW) / 2))
        setCropY(Math.round((imgH - newH) / 2))
    }

    const tabs = [
        { id: 'resize', label: 'Resize', Icon: Maximize },
        { id: 'crop', label: 'Crop', Icon: Crop },
        { id: 'filters', label: 'Filters', Icon: Palette },
        { id: 'adjust', label: 'Adjust', Icon: Sliders },
        { id: 'rotate', label: 'Rotate', Icon: RotateCcw },
        { id: 'convert', label: 'Convert', Icon: Settings },
        { id: 'removebg', label: 'Remove BG', Icon: Eraser }
    ]

    const filters = ['grayscale', 'sepia', 'invert', 'blur', 'sharpen', 'warm', 'cool', 'vivid']

    const resizePresets = [
        { l: 'IG Post', w: 1080, h: 1080 },
        { l: 'IG Story', w: 1080, h: 1920 },
        { l: 'HD 720p', w: 1280, h: 720 },
        { l: 'Full HD', w: 1920, h: 1080 },
        { l: 'YouTube', w: 1280, h: 720 },
        { l: 'Portrait', w: 1080, h: 1350 }
    ]

    const cropPresets = [
        { l: 'Square (1:1)', w: 1, h: 1 },
        { l: 'Landscape (16:9)', w: 16, h: 9 },
        { l: 'Portrait (9:16)', w: 9, h: 16 },
        { l: 'Standard (4:3)', w: 4, h: 3 },
        { l: 'Wide (21:9)', w: 21, h: 9 },
        { l: 'Classic (3:2)', w: 3, h: 2 }
    ]

    return (
        <Box minH="100vh" h="100vh" bg="#000" display="flex" flexDir="column">
            <Flex justify="space-between" align="center" px={5} h="56px" bg="#0a0a0a" borderBottom="1px solid #1a1a1a">
                <HStack gap={3}>
                    <img src="/vite.svg" style={{ width: '22px', height: '22px' }} alt="Logo" />
                    <Text fontSize="md" color="white" fontWeight="600">ImageProcessor</Text>
                </HStack>
                <HStack gap={4}>
                    <Text color="#888" fontSize="sm" display={{ base: 'none', md: 'block' }}>Hello, <Text as="span" color="white">{user?.name}</Text></Text>
                    <Button size="sm" {...btnStyle} onClick={() => setCurrentPage('gallery')}><Images size={14} style={{ marginRight: '6px' }} />Gallery</Button>
                    <Button size="sm" {...btnStyle} onClick={logout}>Logout</Button>
                </HStack>
            </Flex>

            <Box flex={1} overflow="hidden">
                {!uploadedImage ? (
                    <Flex justify="center" align="center" h="100%" p={6}>
                        <Flex gap={0} maxW="1000px" w="full">
                            <Box flex={1} bg="#050505" p={10} borderRadius="xl 0 0 xl" border="1px solid #1a1a1a" borderRight="none" display={{ base: 'none', md: 'block' }}>
                                <Text color="#555" fontSize="xs" textTransform="uppercase" mb={4}>Features</Text>
                                <VStack align="start" gap={2}>
                                    {['Resize & Crop', '8+ Filters', 'Remove Background', 'Rotate & Convert', 'Save & Share Links'].map((f, i) => (
                                        <HStack key={i} gap={2}><Check size={12} color="#4a4" /><Text color="#888" fontSize="sm">{f}</Text></HStack>
                                    ))}
                                </VStack>
                            </Box>
                            <Box flex={1} bg="#0a0a0a" border="2px dashed #2a2a2a" borderRadius={{ base: 'xl', md: '0 xl xl 0' }} p={16} textAlign="center" cursor="pointer" onClick={() => fileInputRef.current?.click()}>
                                <VStack gap={4}>
                                    <Box p={4} bg="#111" borderRadius="full"><Upload size={32} color="#666" /></Box>
                                    <VStack gap={1}>
                                        <Text fontSize="lg" color="white" fontWeight="600">Upload Image</Text>
                                        <Text color="#666" fontSize="sm">Select the file from local storage</Text>
                                    </VStack>
                                    <Text fontSize="xs" color="#444">JPEG, PNG, WebP • Max 10MB</Text>
                                </VStack>
                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} hidden />
                            </Box>
                        </Flex>
                    </Flex>
                ) : (
                    <Flex direction="column" h="100%">
                        <Box px={5} py={3} bg="#0a0a0a" borderBottom="1px solid #1a1a1a">
                            <HStack gap={2} overflowX="auto">
                                {tabs.map(t => (
                                    <Button key={t.id} bg={activeTab === t.id ? 'white' : '#111'} color={activeTab === t.id ? 'black' : '#666'} border="1px solid" borderColor={activeTab === t.id ? 'white' : '#2a2a2a'} onClick={() => setActiveTab(t.id)} size="sm" px={4} h="36px">
                                        <t.Icon size={14} style={{ marginRight: '6px' }} />{t.label}
                                    </Button>
                                ))}
                            </HStack>
                        </Box>

                        <Flex flex={1} overflow="hidden">
                            <Box w="300px" bg="#0a0a0a" borderRight="1px solid #1a1a1a" display={{ base: 'none', md: 'flex' }} flexDir="column">
                                <Box p={5} overflowY="auto" flex={1}>
                                    <VStack gap={5} align="stretch">
                                        {activeTab === 'resize' && (
                                            <>
                                                <Text color="white" fontSize="sm" fontWeight="500">Resize</Text>
                                                <SimpleGrid columns={2} gap={2} mb={2}>
                                                    {resizePresets.map(p => (
                                                        <PresetButton
                                                            key={p.l}
                                                            label={p.l}
                                                            isActive={activeResizePreset === p.l}
                                                            onClick={() => { setResizeWidth(p.w); setResizeHeight(p.h); setActiveResizePreset(p.l) }}
                                                        />
                                                    ))}
                                                </SimpleGrid>
                                                <HStack>
                                                    <Input placeholder="Width" value={resizeWidth} onChange={e => { setResizeWidth(e.target.value); setActiveResizePreset(null) }} {...inputStyle} />
                                                    <Text color="#555">×</Text>
                                                    <Input placeholder="Height" value={resizeHeight} onChange={e => { setResizeHeight(e.target.value); setActiveResizePreset(null) }} {...inputStyle} />
                                                </HStack>
                                                <Button {...btnStyle} onClick={handleResize} isLoading={loading}>Apply Resize</Button>
                                            </>
                                        )}

                                        {activeTab === 'crop' && (
                                            <>
                                                <Text color="white" fontSize="sm" fontWeight="500">Crop Presets</Text>
                                                <SimpleGrid columns={2} gap={2} mb={2}>
                                                    {cropPresets.map(r => (
                                                        <PresetButton
                                                            key={r.l}
                                                            label={r.l}
                                                            isActive={cropWidth && cropHeight && Math.abs((Number(cropWidth) / Number(cropHeight)) - (r.w / r.h)) < 0.01}
                                                            onClick={() => applyCropPreset(r)}
                                                        />
                                                    ))}
                                                </SimpleGrid>
                                                <Text color="white" fontSize="sm" fontWeight="500">Manual Crop</Text>
                                                <HStack><Input placeholder="X" value={cropX} onChange={e => setCropX(e.target.value)} {...inputStyle} /><Input placeholder="Y" value={cropY} onChange={e => setCropY(e.target.value)} {...inputStyle} /></HStack>
                                                <HStack><Input placeholder="Width" value={cropWidth} onChange={e => setCropWidth(e.target.value)} {...inputStyle} /><Input placeholder="Height" value={cropHeight} onChange={e => setCropHeight(e.target.value)} {...inputStyle} /></HStack>
                                                <Button {...btnStyle} onClick={handleCrop} isLoading={loading}>Apply Crop</Button>
                                            </>
                                        )}

                                        {activeTab === 'filters' && (
                                            <>
                                                <Text color="white" fontSize="sm" fontWeight="500">Filters</Text>
                                                <SimpleGrid columns={2} gap={2}>
                                                    {filters.map(f => (
                                                        <Button key={f} {...btnStyle} onClick={() => handleFilter(f)} isLoading={loading}>{f}</Button>
                                                    ))}
                                                </SimpleGrid>
                                            </>
                                        )}

                                        {activeTab === 'adjust' && (
                                            <>
                                                <Text color="white" fontSize="sm" fontWeight="500">Adjustments</Text>
                                                <Text color="#888" fontSize="xs" mt={2}>Brightness: {brightness}</Text>
                                                <input type="range" min="0.5" max="2" step="0.1" value={brightness} onChange={e => setBrightness(e.target.value)} style={{ width: '100%', marginBottom: '10px' }} />
                                                <Text color="#888" fontSize="xs">Saturation: {saturation}</Text>
                                                <input type="range" min="0" max="3" step="0.1" value={saturation} onChange={e => setSaturation(e.target.value)} style={{ width: '100%', marginBottom: '15px' }} />
                                                <Button {...btnStyle} onClick={handleAdjust} isLoading={loading}>Apply Adjustments</Button>
                                            </>
                                        )}

                                        {activeTab === 'rotate' && (
                                            <>
                                                <Text color="white" fontSize="sm" fontWeight="500">Rotate</Text>
                                                <HStack>
                                                    {[0, 90, 180, 270].map(a => (
                                                        <Button key={a} {...btnStyle} bg={rotateAngle === a ? 'white' : '#1a1a1a'} color={rotateAngle === a ? 'black' : 'white'} onClick={() => setRotateAngle(a)}>{a}°</Button>
                                                    ))}
                                                </HStack>
                                                <Input placeholder="Custom Angle" value={rotateAngle} onChange={e => setRotateAngle(Number(e.target.value))} {...inputStyle} type="number" />
                                                <Button {...btnStyle} onClick={handleRotate} isLoading={loading}>Apply Rotate</Button>
                                            </>
                                        )}

                                        {activeTab === 'convert' && (
                                            <>
                                                <Text color="white" fontSize="sm" fontWeight="500">Convert Format</Text>
                                                <HStack>
                                                    {['jpeg', 'png', 'webp'].map(f => (
                                                        <Button key={f} {...btnStyle} bg={convertFormat === f ? 'white' : '#1a1a1a'} color={convertFormat === f ? 'black' : 'white'} onClick={() => setConvertFormat(f)}>{f.toUpperCase()}</Button>
                                                    ))}
                                                </HStack>
                                                <Text color="white" fontSize="sm" fontWeight="500">Quality: {compressQuality}%</Text>
                                                <input type="range" min="10" max="100" value={compressQuality} onChange={e => setCompressQuality(Number(e.target.value))} style={{ width: '100%' }} />
                                                <Button {...btnStyle} onClick={handleConvert} isLoading={loading}>Convert</Button>
                                            </>
                                        )}

                                        {activeTab === 'removebg' && (
                                            <>
                                                <Text color="white" fontSize="sm" fontWeight="500">Remove Background</Text>
                                                <Text color="#666" fontSize="xs">Works best with solid color backgrounds</Text>
                                                <Button {...btnStyle} onClick={handleRemoveBg} isLoading={loading}>Remove Background</Button>
                                                       </>
                                        )}
                                    </VStack>
                                </Box>

                                <Box p={5} borderTop="1px solid #1a1a1a" bg="#080808">
                                    <Text color="#666" fontSize="xs" fontWeight="600" mb={3} textTransform="uppercase">Original Image</Text>
                                    <SimpleGrid columns={2} gap={4}>
                                        <StatItem label="Size" value={formatBytes(uploadedImage.size)} />
                                        <StatItem label="Dim" value={`${uploadedImage.width}×${uploadedImage.height}`} />
                                        <StatItem label="Fmt" value={getFormat(uploadedImage.filename)} />
                                        <StatItem label="Ratio" value={getAspectRatio(uploadedImage.width, uploadedImage.height)} />
                                    </SimpleGrid>
                                </Box>
                            </Box>

                            <Box flex={1} bg="#000" p={4} display="flex" alignItems="center" justifyContent="center" position="relative" overflow="hidden">
                                {error && (
                                    <Box position="absolute" top={4} left="50%" transform="translateX(-50%)" bg="#220000" border="1px solid #440000" borderRadius="md" px={4} py={2} color="#ff4444" zIndex={10}>
                                        <HStack><AlertCircle size={14} /><Text fontSize="sm">{error}</Text></HStack>
                                    </Box>
                                )}

                                {loading && (
                                    <Box position="absolute" inset={0} bg="rgba(0,0,0,0.8)" display="flex" alignItems="center" justifyContent="center" zIndex={20}>
                                        <VStack gap={4}>
                                            <Spinner size="xl" color="white" thickness="3px" />
                                            <Text color="white" fontSize="sm" fontWeight="500">Processing...</Text>
                                        </VStack>
                                    </Box>
                                )}

                                <Flex gap={4} h="100%" w="100%" justify="center" align="center">
                                    <VStack flex={1} h="100%" gap={3}>
                                        <Text color="#666" fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wide">Original</Text>
                                        <Box flex={1} display="flex" alignItems="center" justifyContent="center" bg="#050505" borderRadius="lg" border="1px solid #1a1a1a" p={3} w="100%" overflow="hidden">
                                            <img src={`${BASE_URL}${uploadedImage.path}`} alt="Original" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                                        </Box>
                                    </VStack>

                                    <VStack flex={1} h="100%" gap={3}>
                                        <Text color={processedImage ? '#4a4' : '#444'} fontSize="xs" fontWeight="600" textTransform="uppercase" mb={2} textAlign="center">Preview</Text>
                                        <Box flex={1} display="flex" alignItems="center" justifyContent="center" bg="#050505" borderRadius="lg" border={processedImage ? "1px solid #1a3a1a" : "1px dashed #1a1a1a"} p={3} w="100%" overflow="hidden">
                                            {processedImage ? (
                                                <img src={`${BASE_URL}${processedImage.path}`} alt="Processed" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px' }} />
                                            ) : (
                                                <Text color="#333" fontSize="sm">Apply changes to see preview</Text>
                                            )}
                                        </Box>
                                    </VStack>
                                </Flex>
                            </Box>

                            <Box w="220px" bg="#0a0a0a" borderLeft="1px solid #1a1a1a" display={{ base: 'none', lg: 'flex' }} flexDir="column">
                                <Box p={5} flex={1} overflowY="auto">
                                    <Text color={processedImage ? '#4a4' : '#444'} fontSize="xs" fontWeight="600" mb={3} textTransform="uppercase">Processed Stats</Text>
                                    {processedImage ? (
                                        <SimpleGrid columns={1} gap={4}>
                                            <StatItem label="Size" value={formatBytes(processedImage.size)} />
                                            <StatItem label="Dimensions" value={`${processedImage.width}×${processedImage.height}`} />
                                            <StatItem label="Format" value={getFormat(processedImage.filename)} />
                                            <StatItem label="Aspect Ratio" value={getAspectRatio(processedImage.width, processedImage.height)} />
                                        </SimpleGrid>
                                    ) : (
                                        <Text color="#333" fontSize="xs" textAlign="center" py={10}>Apply edits to see new stats</Text>
                                    )}
                                </Box>

                                <Box p={5} borderTop="1px solid #1a1a1a" bg="#080808">
                                    <HStack justify="space-between" mb={4}>
                                        <Text color="white" fontSize="sm" fontWeight="500">Actions</Text>
                                        <Text fontSize="xs" color="#555">{saveCount} / {SAVE_LIMIT} saves</Text>
                                    </HStack>
                                    <VStack gap={3} align="stretch">
                                        <Button bg="white" color="black" h="40px" onClick={handleSave} isLoading={saving} isDisabled={!processedImage || saved || saveCount >= SAVE_LIMIT}>
                                            {saved ? <><Check size={14} style={{ marginRight: '6px' }} />Saved</> : <><Save size={14} style={{ marginRight: '6px' }} />Save</>}
                                        </Button>
                                        <Button {...btnStyle} onClick={handleDownload}><Download size={14} style={{ marginRight: '6px' }} />Download</Button>
                                        <Button {...btnStyle} onClick={handleResetEdits} isDisabled={!processedImage}><RotateCcw size={14} style={{ marginRight: '6px' }} />Reset Edits</Button>
                                        <Button {...btnStyle} color="#ff5555" onClick={resetAll}>New Image</Button>
                                    </VStack>
                                </Box>
                            </Box>
                        </Flex>
                    </Flex>
                )}
            </Box>
        </Box>
    )
}

export default ImageProcessor
