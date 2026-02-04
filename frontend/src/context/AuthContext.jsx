import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get('/auth/check');
            if (response.data.authenticated) {
                setUser({ username: response.data.username, role: response.data.role });
            } else {
                setUser(null);
            }
        } catch (error) {
            // If 401 unauth, just null
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        setUser({ username: response.data.username, role: response.data.role });
        return response.data;
    };

    const signup = async (username, password) => {
        const response = await api.post('/auth/signup', { username, password });
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error("Logout error", e);
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, signup, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
