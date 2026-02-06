import React from 'react';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { Box, VStack, Text } from '@gluestack-ui/themed';

// Reusable logo component with title and subtitle
export default function AppLogo({ subtitle, size = 'medium' }) {
    const iconSize = size === 'large' ? 40 : 32;
    const boxSize = size === 'large' ? 80 : 64;
    const borderRadius = size === 'large' ? 20 : 32;

    return (
        <VStack alignItems="center">
            <Box
                w={boxSize}
                h={boxSize}
                rounded={borderRadius}
                bg={COLORS.inputBg}
                justifyContent="center"
                alignItems="center"
                mb={16}
                borderWidth={1}
                borderColor={COLORS.borderLight}
            >
                <Feather name="image" size={iconSize} color={COLORS.text} />
            </Box>
            <Text fontSize={28} fontWeight="700" color={COLORS.text} mb={8}>
                ImageProcessor
            </Text>
            {subtitle && (
                <Text fontSize={15} color={COLORS.textSecondary} textAlign="center">
                    {subtitle}
                </Text>
            )}
        </VStack>
    );
}
