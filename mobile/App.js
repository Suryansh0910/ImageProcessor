import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import GetStartedScreen from './src/screens/GetStartedScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ProcessorScreen from './src/screens/ProcessorScreen';
import GalleryScreen from './src/screens/GalleryScreen';

// Main navigation component
function AppContent() {
  const { loading, currentPage } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Simple page switching based on currentPage state
  if (currentPage === 'getstarted') {
    return <GetStartedScreen />;
  }

  if (currentPage === 'login') {
    return <LoginScreen />;
  }

  if (currentPage === 'signup') {
    return <SignupScreen />;
  }

  if (currentPage === 'gallery') {
    return <GalleryScreen />;
  }

  if (currentPage === 'processor') {
    return <ProcessorScreen />;
  }

  // Default to getstarted
  return <GetStartedScreen />;
}

import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

export default function App() {
  return (
    <GluestackUIProvider config={config}>
      <AuthProvider>
        <StatusBar style="light" />
        <AppContent />
      </AuthProvider>
    </GluestackUIProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
