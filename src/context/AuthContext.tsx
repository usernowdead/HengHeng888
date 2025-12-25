"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeCSRFToken } from '@/lib/csrf-client';

interface User {
    id: string;
    username: string;
    email: string;
    role: number;
    profile?: string | null;
    time: string;
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string;
    balance?: number;
}

interface AuthContextType {
    isAuth: boolean;
    user: User | null;
    login: (token: string, user: User) => Promise<void>;
    logout: () => void;
    loading: boolean;
    validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuth, setIsAuth] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize CSRF token when app loads
        initializeCSRFToken().catch(err => {
            console.error('Failed to initialize CSRF token:', err);
        });
        
        // Try to validate token on mount
        // Cookies are sent automatically, so we can just call /api/v1/auth/me
        // It will use cookie if available, or fallback to Authorization header
        validateToken();
    }, []);

    // Periodic token validation every 5 minutes when user is authenticated
    useEffect(() => {
        if (!isAuth) return;

        const interval = setInterval(async () => {
            try {
                // Cookies are sent automatically with credentials: 'include'
                const response = await fetch('/api/v1/auth/me', {
                    credentials: 'include', // Include cookies
                });

                const data = await response.json();

                if (!data.success) {
                    // Token expired or invalid, logout user
                    // Clear localStorage for backward compatibility
                    localStorage.removeItem('auth_token');
                    setUser(null);
                    setIsAuth(false);
                }
            } catch (error) {
                console.error('Periodic token validation error:', error);
                // Don't logout on network errors, just log
            }
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [isAuth]);

    const validateToken = async (token?: string): Promise<boolean> => {
        try {
            // Build headers - support both cookie (new) and Authorization header (backward compatibility)
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            
            // If token provided, use Authorization header (backward compatibility)
            // Otherwise, rely on cookies (preferred method)
            const authToken = token || localStorage.getItem('auth_token');
            if (authToken) {
                headers['Authorization'] = `Bearer ${authToken}`;
            }

            const response = await fetch('/api/v1/auth/me', {
                headers,
                credentials: 'include', // Always include cookies
            });

            const data = await response.json();

            if (data.success) {
                setUser(data.data.user);
                setIsAuth(true);
                return true;
            } else {
                // Token invalid, remove it
                localStorage.removeItem('auth_token');
                setUser(null);
                setIsAuth(false);
                return false;
            }
        } catch (error) {
            console.error('Token validation error:', error);
            localStorage.removeItem('auth_token');
            setUser(null);
            setIsAuth(false);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const login = async (token: string, userData: User): Promise<void> => {
        // Store token in localStorage for backward compatibility
        // But cookies are preferred (set by server automatically)
        if (token) {
            localStorage.setItem('auth_token', token);
        }
        
        setUser(userData);
        setIsAuth(true);

        // Validate token immediately after login to ensure it's still valid
        // This will use cookies if available, or fallback to token
        const isValid = await validateToken(token);
        if (!isValid) {
            // Token invalid immediately after login, logout
            localStorage.removeItem('auth_token');
            setUser(null);
            setIsAuth(false);
        }
    };

    const logout = async () => {
        // Clear localStorage
        localStorage.removeItem('auth_token');
        
        // Call logout endpoint to clear cookies
        try {
            await fetch('/api/v1/auth/logout', {
                method: 'POST',
                credentials: 'include', // Include cookies
            });
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with logout even if API call fails
        }
        
        setUser(null);
        setIsAuth(false);
    };

    const value: AuthContextType = {
        isAuth,
        user,
        login,
        logout,
        loading,
        validateToken: () => validateToken(),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
