'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'enseignant' | 'etudiant';
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials: any) => {
        const response = await api.post('/login', credentials);
        const { access_token, user: loggedUser } = response.data;

        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        setToken(access_token);
        setUser(loggedUser);

        if (loggedUser.role === 'admin') router.push('/admin/dashboard');
        else if (loggedUser.role === 'enseignant') router.push('/enseignant/dashboard');
        else router.push('/etudiant/dashboard');
    };

    const logout = async () => {
        try { await api.post('/logout'); } catch (e) {}
        localStorage.clear();
        setUser(null);
        setToken(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth doit être utilisé dans un AuthProvider");
    return context;
};