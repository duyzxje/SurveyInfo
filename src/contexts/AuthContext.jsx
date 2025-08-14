import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

// Create context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to login
    const login = async (username, password) => {
        try {
            const { token: loginToken } = await authService.login(username, password);

            localStorage.setItem('token', loginToken);
            localStorage.setItem('isAuthenticated', 'true');

            setToken(loginToken);
            setIsAuthenticated(true);

            // Fetch user profile after successful login
            try {
                const profile = await authService.getProfile(loginToken);
                setUser(profile?.user || profile);
                localStorage.setItem('user', JSON.stringify(profile?.user || profile));
            } catch (profileError) {
                // If profile fetch fails, still keep the token but clear user
                setUser(null);
                localStorage.removeItem('user');
            }

            return { token: loginToken };
        } catch (error) {
            throw error;
        }
    };

    // Function to logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('user');
        setToken(null);
        setIsAuthenticated(false);
        setUser(null);
    };

    // Function to get user profile
    const getProfile = async () => {
        try {
            const response = await authService.getProfile(token);
            setUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
            return response;
        } catch (error) {
            // If token is invalid, logout
            logout();
            throw error;
        }
    };

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = () => {
            const storedToken = localStorage.getItem('token');
            const authStatus = localStorage.getItem('isAuthenticated') === 'true';

            if (authStatus && storedToken) {
                setIsAuthenticated(true);
                setToken(storedToken);

                try {
                    const userData = JSON.parse(localStorage.getItem('user'));
                    setUser(userData);
                } catch (e) {
                    setUser(null);
                }
            } else {
                setIsAuthenticated(false);
                setToken(null);
                setUser(null);
            }
            setLoading(false);
        };

        checkAuth();

        // Listen for storage changes in other tabs/windows
        window.addEventListener('storage', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
        };
    }, []);

    // Expose the auth context
    const value = {
        isAuthenticated,
        user,
        token,
        login,
        logout,
        getProfile,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext; 