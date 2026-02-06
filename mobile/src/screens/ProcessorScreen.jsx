import React, { useState, useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';
import FeaturesRow from '../components/FeaturesRow';
import {
    Box,
    VStack,
    HStack,
    Text,
    Image,
    Input,
    InputField,
    Button,
    ButtonText,
    ButtonIcon,
    ButtonSpinner,
    Pressable,
    ScrollView,
    Spinner
} from '@gluestack-ui/themed';

const API_URL = 'http://localhost:3000/api/image';
const BASE_URL = 'http://localhost:3000';
const SAVE_LIMIT = 3;

export default function ProcessorScreen() {
    const { user, logout, setCurrentPage } = useAuth();

    // Main states
    const [uploadedImage, setUploadedImage] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [activeTab, setActiveTab] = useState('resize');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');
    const [saveCount, setSaveCount] = useState(0);

    // Form states
    const [resizeWidth, setResizeWidth] = useState('');
    const [resizeHeight, setResizeHeight] = useState('');
    const [cropX, setCropX] = useState('');
    const [cropY, setCropY] = useState('');
    const [cropWidth, setCropWidth] = useState('');
    const [cropHeight, setCropHeight] = useState('');
    const [rotateAngle, setRotateAngle] = useState(90);
    const [convertFormat, setConvertFormat] = useState('jpeg');
    const [compressQuality, setCompressQuality] = useState(60);

    const userId = user?._id || user?.id;

    useEffect(() => {
        if (userId) {
            fetch(`${API_URL}/gallery/count/${userId}`)
                .then(res => res.json())
                .then(data => setSaveCount(data.count || 0))
                .catch(() => { });
        }
    }, [userId]);

    // Pick image from gallery
    async function pickImage() {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
                uploadImage(result.assets[0]);
            }
        } catch (err) {
            setError('Failed to pick image');
        }
    }

    // Upload image to server
    async function uploadImage(asset) {
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('image', {
                uri: asset.uri,
                type: 'image/jpeg',
                name: 'image.jpg'
            });

            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setUploadedImage({ ...data.file, originalName: 'image.jpg' });
            setProcessedImage(null);
            setSaved(false);
        } catch (err) {
            setError(err.message || 'Upload failed');
        }
        setLoading(false);
    }

    // Generic API call for processing
    async function apiCall(endpoint, body = {}) {
        if (!uploadedImage) return null;

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_URL}/${endpoint}/${uploadedImage.filename}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setLoading(false);
            return data;
        } catch (err) {
            setError(err.message);
            setLoading(false);
            return null;
        }
    }

    // Process handlers
    async function handleResize() {
        if (!resizeWidth && !resizeHeight) return;
        const data = await apiCall('resize', {
            width: Number(resizeWidth) || null,
            height: Number(resizeHeight) || null
        });
        if (data) {
            setProcessedImage(data.file);
            setSaved(false);
        }
    }

    async function handleCrop() {
        if (!cropWidth || !cropHeight) return;
        const data = await apiCall('crop', {
            left: Number(cropX) || 0,
            top: Number(cropY) || 0,
            width: Number(cropWidth),
            height: Number(cropHeight)
        });
        if (data) {
            setProcessedImage(data.file);
            setSaved(false);
        }
    }

    async function handleFilter(filter) {
        const data = await apiCall('filter', { filter });
        if (data) {
            setProcessedImage(data.file);
            setSaved(false);
        }
    }

    async function handleRotate() {
        const data = await apiCall('rotate', { angle: rotateAngle });
        if (data) {
            setProcessedImage(data.file);
            setSaved(false);
        }
    }

    async function handleConvert() {
        const data = await apiCall('convert', {
            format: convertFormat,
            quality: compressQuality
        });
        if (data) {
            setProcessedImage(data.file);
            setSaved(false);
        }
    }

    async function handleRemoveBg() {
        const data = await apiCall('remove-bg', { tolerance: 40 });
        if (data) {
            setProcessedImage(data.file);
            setSaved(false);
        }
    }

    async function handleSave() {
        if (!processedImage || !userId) {
            setError('No image to save');
            return;
        }
        if (saveCount >= SAVE_LIMIT) {
            setError('Save limit reached. Delete images from Gallery.');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/save/${processedImage.filename}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    originalName: uploadedImage?.originalName || processedImage.filename
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setSaveCount(data.count);
            setSaved(true);
        } catch (err) {
            setError(err.message);
        }
        setSaving(false);
    }

    function handleDownload() {
        const img = processedImage || uploadedImage;
        if (img) {
            Linking.openURL(`${BASE_URL}${img.path}`);
        }
    }

    function resetEdits() {
        setProcessedImage(null);
        setSaved(false);
        setError('');
    }

    function resetAll() {
        setUploadedImage(null);
        setProcessedImage(null);
        setResizeWidth('');
        setResizeHeight('');
        setCropX('');
        setCropY('');
        setCropWidth('');
        setCropHeight('');
        setSaved(false);
        setError('');
    }

    // Tab configurations
    const tabs = [
        { id: 'resize', label: 'Resize' },
        { id: 'crop', label: 'Crop' },
        { id: 'filters', label: 'Filters' },
        { id: 'rotate', label: 'Rotate' },
        { id: 'convert', label: 'Convert' },
        { id: 'removebg', label: 'Remove BG' }
    ];

    const filters = ['grayscale', 'sepia', 'invert', 'blur', 'sharpen', 'warm', 'cool', 'vivid'];

    const resizePresets = [
        { label: 'IG Post', w: 1080, h: 1080 },
        { label: 'IG Story', w: 1080, h: 1920 },
        { label: 'HD 720p', w: 1280, h: 720 },
        { label: 'Full HD', w: 1920, h: 1080 }
    ];

    const cropPresets = [
        { label: 'Square', w: 500, h: 500 },
        { label: 'Portrait', w: 400, h: 600 },
        { label: 'Landscape', w: 600, h: 400 },
    ];

    // Render upload screen
    if (!uploadedImage) {
        return (
            <Box flex={1} bg={COLORS.background}>
                {/* Header */}
                <HStack justifyContent="space-between" alignItems="center" p={16} pt={50} bg={COLORS.cardBg} borderBottomWidth={1} borderColor={COLORS.border}>
                    <HStack alignItems="center" space="xs">
                        <Feather name="image" size={20} color="#fff" />
                        <Text color="#fff" fontSize={18} fontWeight="600">ImageProcessor</Text>
                    </HStack>
                    <HStack space="sm">
                        <Button size="xs" variant="outline" borderColor={COLORS.borderLight} onPress={() => setCurrentPage('gallery')}>
                            <ButtonText color="#fff">Gallery</ButtonText>
                        </Button>
                        <Button size="xs" variant="outline" borderColor={COLORS.borderLight} onPress={logout}>
                            <ButtonText color="#fff">Logout</ButtonText>
                        </Button>
                    </HStack>
                </HStack>

                <Box flex={1} justifyContent="center" p={20}>
                    {/* Upload Box */}
                    <Pressable
                        onPress={pickImage}
                        bg={COLORS.cardBg}
                        borderWidth={2}
                        borderColor={COLORS.borderLight}
                        borderStyle="dashed"
                        rounded={12}
                        p={40}
                        alignItems="center"
                    >
                        <Box w={64} h={64} rounded="$full" bg={COLORS.inputBg} justifyContent="center" alignItems="center" mb={16}>
                            <Feather name="upload" size={32} color={COLORS.textSecondary} />
                        </Box>
                        <Text color="#fff" fontSize={20} fontWeight="600" mb={8}>Upload Image</Text>
                        <Text color={COLORS.textSecondary} fontSize={14} mb={16}>Tap to select from gallery</Text>
                        <Text color={COLORS.textDark} fontSize={12}>JPEG, PNG, WebP • Max 10MB</Text>
                    </Pressable>

                    <Box mt={20}>
                        <FeaturesRow />
                    </Box>
                </Box>
            </Box>
        );
    }

    // Render processor screen
    return (
        <Box flex={1} bg={COLORS.background}>
            {/* Header */}
            <HStack justifyContent="space-between" alignItems="center" p={16} pt={50} bg={COLORS.cardBg} borderBottomWidth={1} borderColor={COLORS.border}>
                <HStack alignItems="center" space="xs">
                    <Feather name="image" size={20} color="#fff" />
                    <Text color="#fff" fontSize={18} fontWeight="600">ImageProcessor</Text>
                </HStack>
                <HStack space="sm">
                    <Button size="xs" variant="outline" borderColor={COLORS.borderLight} onPress={() => setCurrentPage('gallery')}>
                        <ButtonText color="#fff">Gallery</ButtonText>
                    </Button>
                    <Button size="xs" variant="outline" borderColor={COLORS.borderLight} onPress={logout}>
                        <ButtonText color="#fff">Logout</ButtonText>
                    </Button>
                </HStack>
            </HStack>

            {/* Tabs */}
            <Box bg={COLORS.cardBg} borderBottomWidth={1} borderColor={COLORS.border} h={60}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <HStack space="xs" p={10} alignItems="center">
                        {tabs.map(tab => (
                            <Pressable
                                key={tab.id}
                                px={16}
                                py={8}
                                bg={activeTab === tab.id ? '#fff' : COLORS.inputBg}
                                rounded={6}
                                borderWidth={1}
                                borderColor={COLORS.borderLight}
                                onPress={() => setActiveTab(tab.id)}
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Text color={activeTab === tab.id ? '#000' : COLORS.textSecondary} fontSize={14} fontWeight="500">
                                    {tab.label}
                                </Text>
                            </Pressable>
                        ))}
                    </HStack>
                </ScrollView>
            </Box>

            {/* Error */}
            {error ? (
                <Box bg={COLORS.errorBg} borderWidth={1} borderColor={COLORS.errorBorder} m={12} p={12} rounded={8}>
                    <HStack justifyContent="center" alignItems="center" space="xs">
                        <Feather name="alert-circle" size={16} color={COLORS.error} />
                        <Text color={COLORS.error}>{error}</Text>
                    </HStack>
                </Box>
            ) : null}

            {/* Loading Overlay */}
            {loading && (
                <Box position="absolute" top={0} left={0} right={0} bottom={0} bg="rgba(0,0,0,0.8)" justifyContent="center" alignItems="center" zIndex={100}>
                    <Spinner size="large" color="#fff" />
                    <Text color="#fff" mt={12}>Processing...</Text>
                </Box>
            )}

            <ScrollView flex={1}>
                {/* Image Preview */}
                <HStack p={12} space="md">
                    <Box flex={1} bg="#050505" rounded={8} borderWidth={1} borderColor={COLORS.border} p={8}>
                        <Text color={COLORS.textSecondary} fontSize={12} textAlign="center" textTransform="uppercase" mb={8}>Original</Text>
                        <Image
                            source={{ uri: `${BASE_URL}${uploadedImage.path}` }}
                            w="$full"
                            h={150}
                            alt="Original"
                            resizeMode="contain"
                            rounded={4}
                        />
                    </Box>
                    <Box flex={1} bg="#050505" rounded={8} borderWidth={1} borderColor={COLORS.border} p={8}>
                        <Text color={processedImage ? '#4a4' : COLORS.textSecondary} fontSize={12} textAlign="center" textTransform="uppercase" mb={8}>Preview</Text>
                        {processedImage ? (
                            <Image
                                source={{ uri: `${BASE_URL}${processedImage.path}` }}
                                w="$full"
                                h={150}
                                alt="Processed"
                                resizeMode="contain"
                                rounded={4}
                            />
                        ) : (
                            <Box h={150} justifyContent="center" alignItems="center">
                                <Text color={COLORS.textDark} fontSize={12} textAlign="center">Apply changes to see preview</Text>
                            </Box>
                        )}
                    </Box>
                </HStack>

                {/* Controls */}
                <Box p={16} bg={COLORS.cardBg} mx={12} my={12} rounded={12} borderWidth={1} borderColor={COLORS.border}>
                    {activeTab === 'resize' && (
                        <VStack space="md">
                            <Text color="#fff" fontWeight="500">Presets</Text>
                            <HStack flexWrap="wrap" space="sm">
                                {resizePresets.map(p => (
                                    <Button key={p.label} size="xs" variant="outline" borderColor={COLORS.borderLight} onPress={() => { setResizeWidth(String(p.w)); setResizeHeight(String(p.h)); }}>
                                        <ButtonText color={COLORS.textSecondary}>{p.label}</ButtonText>
                                    </Button>
                                ))}
                            </HStack>
                            <Text color="#fff" fontWeight="500" mt={8}>Custom Size</Text>
                            <HStack space="sm" alignItems="center">
                                <Input flex={1} variant="outline" borderColor={COLORS.borderLight} bg={COLORS.inputBg}>
                                    <InputField placeholder="Width" placeholderTextColor="#666" value={resizeWidth} onChangeText={setResizeWidth} keyboardType="numeric" color="#fff" />
                                </Input>
                                <Text color={COLORS.textMuted}>×</Text>
                                <Input flex={1} variant="outline" borderColor={COLORS.borderLight} bg={COLORS.inputBg}>
                                    <InputField placeholder="Height" placeholderTextColor="#666" value={resizeHeight} onChangeText={setResizeHeight} keyboardType="numeric" color="#fff" />
                                </Input>
                            </HStack>
                            <Button variant="solid" bg={COLORS.border} onPress={handleResize} mt={8}>
                                <ButtonText>Apply Resize</ButtonText>
                            </Button>
                        </VStack>
                    )}

                    {activeTab === 'crop' && (
                        <VStack space="md">
                            <Text color="#fff" fontWeight="500">Presets</Text>
                            <HStack flexWrap="wrap" space="sm">
                                {cropPresets.map(p => (
                                    <Button key={p.label} size="xs" variant="outline" borderColor={COLORS.borderLight} onPress={() => { setCropWidth(String(p.w)); setCropHeight(String(p.h)); }}>
                                        <ButtonText color={COLORS.textSecondary}>{p.label}</ButtonText>
                                    </Button>
                                ))}
                            </HStack>
                            <Text color="#fff" fontWeight="500" mt={8}>Crop Region</Text>
                            <HStack space="sm">
                                <Input flex={1} variant="outline" borderColor={COLORS.borderLight} bg={COLORS.inputBg}>
                                    <InputField placeholder="X" placeholderTextColor="#666" value={cropX} onChangeText={setCropX} keyboardType="numeric" color="#fff" />
                                </Input>
                                <Input flex={1} variant="outline" borderColor={COLORS.borderLight} bg={COLORS.inputBg}>
                                    <InputField placeholder="Y" placeholderTextColor="#666" value={cropY} onChangeText={setCropY} keyboardType="numeric" color="#fff" />
                                </Input>
                            </HStack>
                            <HStack space="sm">
                                <Input flex={1} variant="outline" borderColor={COLORS.borderLight} bg={COLORS.inputBg}>
                                    <InputField placeholder="Width" placeholderTextColor="#666" value={cropWidth} onChangeText={setCropWidth} keyboardType="numeric" color="#fff" />
                                </Input>
                                <Input flex={1} variant="outline" borderColor={COLORS.borderLight} bg={COLORS.inputBg}>
                                    <InputField placeholder="Height" placeholderTextColor="#666" value={cropHeight} onChangeText={setCropHeight} keyboardType="numeric" color="#fff" />
                                </Input>
                            </HStack>
                            <Button variant="solid" bg={COLORS.border} onPress={handleCrop} mt={8}>
                                <ButtonText>Apply Crop</ButtonText>
                            </Button>
                        </VStack>
                    )}

                    {activeTab === 'filters' && (
                        <VStack space="md">
                            <Text color="#fff" fontWeight="500">Filters</Text>
                            <HStack flexWrap="wrap" space="sm">
                                {filters.map(f => (
                                    <Button key={f} size="sm" variant="outline" borderColor={COLORS.borderLight} onPress={() => handleFilter(f)} mb={8}>
                                        <ButtonText color="#fff" textTransform="capitalize">{f}</ButtonText>
                                    </Button>
                                ))}
                            </HStack>
                        </VStack>
                    )}

                    {activeTab === 'rotate' && (
                        <VStack space="md">
                            <Text color="#fff" fontWeight="500">Rotate Angle</Text>
                            <HStack space="sm">
                                {[0, 90, 180, 270].map(a => (
                                    <Pressable
                                        key={a}
                                        flex={1}
                                        bg={rotateAngle === a ? '#fff' : COLORS.border}
                                        p={12}
                                        rounded={6}
                                        borderWidth={1}
                                        borderColor={COLORS.borderLight}
                                        alignItems="center"
                                        onPress={() => setRotateAngle(a)}
                                    >
                                        <Text color={rotateAngle === a ? '#000' : '#fff'}>{a}°</Text>
                                    </Pressable>
                                ))}
                            </HStack>
                            <Button variant="solid" bg={COLORS.border} onPress={handleRotate} mt={8}>
                                <ButtonText>Apply Rotate</ButtonText>
                            </Button>
                        </VStack>
                    )}

                    {activeTab === 'convert' && (
                        <VStack space="md">
                            <Text color="#fff" fontWeight="500">Format</Text>
                            <HStack space="sm">
                                {['jpeg', 'png', 'webp'].map(f => (
                                    <Pressable
                                        key={f}
                                        flex={1}
                                        bg={convertFormat === f ? '#fff' : COLORS.border}
                                        p={12}
                                        rounded={6}
                                        borderWidth={1}
                                        borderColor={COLORS.borderLight}
                                        alignItems="center"
                                        onPress={() => setConvertFormat(f)}
                                    >
                                        <Text color={convertFormat === f ? '#000' : '#fff'} textTransform="uppercase">{f}</Text>
                                    </Pressable>
                                ))}
                            </HStack>
                            <Text color="#fff" fontWeight="500">Quality: {compressQuality}%</Text>
                            <Button variant="solid" bg={COLORS.border} onPress={handleConvert} mt={8}>
                                <ButtonText>Convert</ButtonText>
                            </Button>
                        </VStack>
                    )}

                    {activeTab === 'removebg' && (
                        <VStack space="md">
                            <Text color="#fff" fontWeight="500">Remove Background</Text>
                            <Text color={COLORS.textSecondary} fontSize={12}>Works best with solid color backgrounds</Text>
                            <Button variant="solid" bg={COLORS.border} onPress={handleRemoveBg} mt={8}>
                                <ButtonText>Remove Background</ButtonText>
                            </Button>
                        </VStack>
                    )}
                </Box>

                {/* Actions */}
                <Box p={16} bg="#080808" mx={12} mb={40} rounded={12} borderWidth={1} borderColor={COLORS.border}>
                    <Text color={COLORS.textMuted} fontSize={12} textAlign="center" mb={12}>{saveCount} / {SAVE_LIMIT} saves</Text>

                    <Button
                        size="xl"
                        variant="solid"
                        bg={!processedImage || saved ? '#333' : '#fff'}
                        onPress={handleSave}
                        isDisabled={!processedImage || saved || saving}
                        mb={8}
                    >
                        {saving ? (
                            <ButtonSpinner color="#000" />
                        ) : (
                            <HStack space="xs" alignItems="center">
                                {saved && <Feather name="check" size={16} color="#000" />}
                                <ButtonText color={!processedImage || saved ? '#888' : '#000'} fontWeight="600">
                                    {saved ? 'Saved' : 'Save to Gallery'}
                                </ButtonText>
                            </HStack>
                        )}
                    </Button>

                    <Button
                        size="xl"
                        variant="outline"
                        borderColor={COLORS.borderLight}
                        bg={COLORS.border}
                        onPress={handleDownload}
                        mb={8}
                    >
                        <ButtonText color="#fff">Download</ButtonText>
                    </Button>

                    <Button
                        size="xl"
                        variant="outline"
                        borderColor={COLORS.borderLight}
                        bg={COLORS.border}
                        onPress={resetEdits}
                        isDisabled={!processedImage}
                        mb={8}
                    >
                        <ButtonText color="#fff">Reset Edits</ButtonText>
                    </Button>

                    <Button
                        size="xl"
                        variant="outline"
                        borderColor={COLORS.borderLight}
                        bg={COLORS.border}
                        onPress={resetAll}
                    >
                        <ButtonText color="#ff5555">New Image</ButtonText>
                    </Button>
                </Box>
            </ScrollView>
        </Box>
    );
}
