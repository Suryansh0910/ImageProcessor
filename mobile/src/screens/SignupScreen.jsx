import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';
import AppLogo from '../components/AppLogo';
import {
    Box,
    VStack,
    HStack,
    Text,
    Input,
    InputField,
    Button,
    ButtonText,
    ButtonSpinner,
    Pressable
} from '@gluestack-ui/themed';

export default function SignupScreen() {
    const { signup, setCurrentPage } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSignup() {
        if (!name || !email || !password) {
            setError('Please fill all fields');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        const result = await signup(name, email, password);

        if (!result.success) {
            setError(result.error);
        }
        setLoading(false);
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Box flex={1} bg={COLORS.background}>
                <Box flex={1} justifyContent="center" p={24}>
                    {/* Logo and Title */}
                    <Box alignItems="center" mb={40}>
                        <AppLogo subtitle="Create your account" />
                    </Box>

                    {/* Error Message */}
                    {error ? (
                        <Box
                            bg={COLORS.errorBg}
                            borderWidth={1}
                            borderColor={COLORS.errorBorder}
                            rounded={8}
                            p={12}
                            mb={16}
                        >
                            <Text color={COLORS.error} textAlign="center">{error}</Text>
                        </Box>
                    ) : null}

                    {/* Form */}
                    <VStack space="md" mb={24}>
                        <Input
                            variant="outline"
                            size="xl"
                            borderWidth={1}
                            borderColor={COLORS.borderLight}
                            bg={COLORS.inputBg}
                            rounded={8}
                        >
                            <InputField
                                placeholder="Name"
                                placeholderTextColor={COLORS.textSecondary}
                                value={name}
                                onChangeText={setName}
                                color={COLORS.text}
                            />
                        </Input>

                        <Input
                            variant="outline"
                            size="xl"
                            borderWidth={1}
                            borderColor={COLORS.borderLight}
                            bg={COLORS.inputBg}
                            rounded={8}
                        >
                            <InputField
                                placeholder="Email"
                                placeholderTextColor={COLORS.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                color={COLORS.text}
                            />
                        </Input>

                        <Input
                            variant="outline"
                            size="xl"
                            borderWidth={1}
                            borderColor={COLORS.borderLight}
                            bg={COLORS.inputBg}
                            rounded={8}
                        >
                            <InputField
                                placeholder="Password"
                                placeholderTextColor={COLORS.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                color={COLORS.text}
                            />
                        </Input>

                        <Button
                            size="xl"
                            variant="solid"
                            bg={COLORS.text}
                            rounded={8}
                            onPress={handleSignup}
                            isDisabled={loading}
                            mt={8}
                        >
                            {loading ? (
                                <ButtonSpinner color={COLORS.background} />
                            ) : (
                                <ButtonText color={COLORS.background} fontWeight="600">Sign Up</ButtonText>
                            )}
                        </Button>
                    </VStack>

                    {/* Login Link */}
                    <HStack justifyContent="center" mt={24}>
                        <Pressable onPress={() => setCurrentPage('login')}>
                            <Text color={COLORS.textSecondary} fontSize={14}>
                                Already have an account? <Text color={COLORS.text} fontWeight="600">Login</Text>
                            </Text>
                        </Pressable>
                    </HStack>
                </Box>
            </Box>
        </KeyboardAvoidingView>
    );
}
