import React from 'react';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';
import AppLogo from '../components/AppLogo';
import FeaturesRow from '../components/FeaturesRow';
import {
    Box,
    Text,
    Button,
    ButtonText,
    ButtonIcon
} from '@gluestack-ui/themed';

export default function GetStartedScreen() {
    const { setCurrentPage } = useAuth();

    return (
        <Box flex={1} bg={COLORS.background}>
            {/* Center Content - Hero + Features */}
            <Box flex={1} justifyContent="center" alignItems="center">
                {/* Hero Section */}
                <Box px={24} mb={40}>
                    <AppLogo
                        size="large"
                        subtitle="Professional image editing in your pocket"
                    />
                </Box>

                {/* Features Section */}
                <Box px={16} w="100%">
                    <FeaturesRow />
                </Box>
            </Box>

            {/* Bottom Buttons */}
            <Box
                p={24}
                pb={40}
                bg={COLORS.cardBg}
                borderTopWidth={1}
                borderColor={COLORS.border}
            >
                <Button
                    size="xl"
                    variant="solid"
                    bg={COLORS.text}
                    borderRadius={12}
                    mb={12}
                    onPress={() => setCurrentPage('signup')}
                    h={56}
                >
                    <ButtonIcon as={Feather} name="user-plus" size={18} color={COLORS.background} mr={10} />
                    <ButtonText color={COLORS.background} fontWeight="600" fontSize={16}>
                        Create Account
                    </ButtonText>
                </Button>

                <Button
                    size="xl"
                    variant="solid"
                    bg={COLORS.border}
                    borderRadius={12}
                    mb={16}
                    borderWidth={1}
                    borderColor={COLORS.borderLight}
                    onPress={() => setCurrentPage('login')}
                    h={56}
                >
                    <ButtonIcon as={Feather} name="log-in" size={18} color={COLORS.text} mr={10} />
                    <ButtonText color={COLORS.text} fontWeight="500" fontSize={16}>
                        Sign In
                    </ButtonText>
                </Button>

                <Text fontSize={13} color={COLORS.textDark} textAlign="center">
                    Free to use • No watermarks
                </Text>
            </Box>
        </Box>
    );
}
