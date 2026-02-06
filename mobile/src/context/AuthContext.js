import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const BASE_URL = 'http://localhost:3000';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState('getstarted');

    // Check if user is already logged in
    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const res = await fetch(`${BASE_URL}/api/auth/verify`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    setCurrentPage('processor');
                }
            }
        } catch (err) {
            console.log('Auth check failed:', err);
        }
        setLoading(false);
    }

    async function login(email, password) {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            await AsyncStorage.setItem('token', data.token);
            setUser(data.user);
            setCurrentPage('processor');
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    async function signup(name, email, password) {
        try {
            const res = await fetch(`${BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            await AsyncStorage.setItem('token', data.token);
            setUser(data.user);
            setCurrentPage('processor');
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    async function logout() {
        await AsyncStorage.removeItem('token');
        setUser(null);
        setCurrentPage('getstarted');
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            currentPage,
            setCurrentPage,
            login,
            signup,
            logout,
            BASE_URL
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
