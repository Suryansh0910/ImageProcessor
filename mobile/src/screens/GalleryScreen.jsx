import React, { useState, useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';
import {
    Box,
    VStack,
    HStack,
    Text,
    Image,
    Button,
    ButtonText,
    ButtonIcon,
    Spinner,
    ScrollView,
    Pressable
} from '@gluestack-ui/themed';

export default function GalleryScreen() {
    const { user, setCurrentPage, BASE_URL } = useAuth();

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    const userId = user?._id || user?.id;

    useEffect(() => {
        loadGallery();
    }, []);

    async function loadGallery() {
        try {
            const res = await fetch(`${BASE_URL}/api/image/gallery/${userId}`);
            const data = await res.json();
            if (res.ok) {
                setImages(data.images || []);
            }
        } catch (err) {
            console.log('Failed to load gallery:', err);
        }
        setLoading(false);
    }

    async function deleteImage(imageId) {
        Alert.alert(
            'Delete Image',
            'Are you sure you want to delete this image?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res = await fetch(`${BASE_URL}/api/image/gallery/${imageId}`, {
                                method: 'DELETE'
                            });
                            if (res.ok) {
                                setImages(images.filter(img => img._id !== imageId));
                            }
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete image');
                        }
                    }
                }
            ]
        );
    }

    function openImage(image) {
        const url = `${BASE_URL}/api/image/public/${image._id}`;
        Linking.openURL(url);
    }

    if (loading) {
        return (
            <Box flex={1} bg={COLORS.background} justifyContent="center" alignItems="center">
                <Spinner size="large" color="#fff" />
            </Box>
        );
    }

    return (
        <Box flex={1} bg={COLORS.background}>
            {/* Header */}
            <HStack
                justifyContent="space-between"
                alignItems="center"
                p={16}
                pt={50}
                bg={COLORS.cardBg}
                borderBottomWidth={1}
                borderColor={COLORS.border}
            >
                <Pressable onPress={() => setCurrentPage('processor')}>
                    <HStack alignItems="center" space="xs">
                        <Feather name="arrow-left" size={20} color="#fff" />
                        <Text color="#fff" fontSize={16}>Back</Text>
                    </HStack>
                </Pressable>
                <Text color="#fff" fontSize={18} fontWeight="600">Gallery</Text>
                <Text color={COLORS.textSecondary} fontSize={14}>{images.length}/3</Text>
            </HStack>

            {/* Gallery Grid */}
            {images.length === 0 ? (
                <Box flex={1} justifyContent="center" alignItems="center" p={24}>
                    <Box
                        w={80}
                        h={80}
                        rounded="$full"
                        bg={COLORS.inputBg}
                        justifyContent="center"
                        alignItems="center"
                        mb={16}
                    >
                        <Feather name="image" size={48} color="#444" />
                    </Box>
                    <Text color="#fff" fontSize={20} fontWeight="600" mb={8}>No saved images</Text>
                    <Text color={COLORS.textSecondary} fontSize={14} textAlign="center">
                        Process and save images to see them here
                    </Text>
                </Box>
            ) : (
                <ScrollView flex={1}>
                    <Box p={12} flexDirection="row" flexWrap="wrap" justifyContent="space-between">
                        {images.map((image) => (
                            <Box
                                key={image._id}
                                w="48%"
                                bg={COLORS.cardBg}
                                rounded={12}
                                mb={12}
                                borderWidth={1}
                                borderColor={COLORS.border}
                                overflow="hidden"
                            >
                                <Pressable onPress={() => openImage(image)}>
                                    <Image
                                        source={{ uri: `${BASE_URL}${image.path}` }}
                                        w="$full"
                                        h={150}
                                        alt={image.originalName || "Gallery Image"}
                                        resizeMode="cover"
                                    />
                                </Pressable>
                                <Box p={12}>
                                    <Text color="#fff" fontSize={14} numberOfLines={1} mb={8}>
                                        {image.originalName || 'Image'}
                                    </Text>
                                    <Button
                                        size="xs"
                                        variant="outline"
                                        borderColor={COLORS.errorBorder}
                                        bg={COLORS.errorBg}
                                        onPress={() => deleteImage(image._id)}
                                    >
                                        <ButtonText color={COLORS.error} fontSize={12}>Delete</ButtonText>
                                    </Button>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </ScrollView>
            )}
        </Box>
    );
}
