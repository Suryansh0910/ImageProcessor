import React from 'react';
import { Feather } from '@expo/vector-icons';
import { FEATURES, COLORS } from '../constants';
import { Box, HStack, VStack, Text } from '@gluestack-ui/themed';

// Reusable features row component
export default function FeaturesRow({ showTitle = true }) {
    return (
        <Box w="$full">
            {showTitle && (
                <Text fontSize={11} color={COLORS.textMuted} letterSpacing={1} textAlign="center" mb={16}>
                    FEATURES
                </Text>
            )}
            <HStack justifyContent="space-between">
                {FEATURES.map((feature, index) => (
                    <Box key={index} flex={1} alignItems="center">
                        <Box
                            w={44}
                            h={44}
                            rounded={12}
                            bg={COLORS.iconBg}
                            justifyContent="center"
                            alignItems="center"
                            mb={8}
                            borderWidth={1}
                            borderColor={COLORS.borderLight}
                        >
                            <Feather name={feature.icon} size={18} color={COLORS.text} />
                        </Box>
                        <Text fontSize={12} color={COLORS.text} fontWeight="500" mb={2}>
                            {feature.label}
                        </Text>
                        <Text fontSize={10} color={COLORS.textMuted} textAlign="center">
                            {feature.desc}
                        </Text>
                    </Box>
                ))}
            </HStack>
        </Box>
    );
}
