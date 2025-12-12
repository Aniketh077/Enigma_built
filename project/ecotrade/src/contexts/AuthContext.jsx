import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from '../store/slices/authSlice'; // <-- 1. IMPORT getMe
import { loginUser, registerUser, logout as logoutAction, clearError } from '../store/slices/authSlice';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector(state => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          await dispatch(getMe());
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch]); 

  const login = async (credentials) => {
    try {
      dispatch(clearError());
      const result = await dispatch(loginUser(credentials));
      
      if (loginUser.fulfilled.match(result)) {
        // User data is already stored in localStorage by authAPI.login
        // Refresh user data from server to ensure consistency
        try {
          await dispatch(getMe());
        } catch (err) {
          console.error('Error refreshing user data after login:', err);
        }
        return { success: true, user: result.payload };
      } else if (loginUser.rejected.match(result)) {
        return { 
          success: false, 
          error: result.payload?.message || 'Login failed' 
        };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (userData) => {
    try {
      dispatch(clearError());
      const result = await dispatch(registerUser(userData));
      
      if (registerUser.fulfilled.match(result)) {
        return { 
          success: true, 
          message: result.payload.message || 'Registration successful! Please check your email to verify your account.',
          requiresVerification: result.payload.requiresVerification || true
        };
      } else if (registerUser.rejected.match(result)) {
        return { 
          success: false, 
          error: result.payload?.message || 'Registration failed' 
        };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const updateUser = async (userData) => {
    try {
      // Refresh user data from server
      await dispatch(getMe());
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    error,
    isInitialized,
    login,
    register,
    logout,
    clearAuthError,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Only render children once initialization is complete */}
      {isInitialized ? children : null /* Or a loading spinner */}
    </AuthContext.Provider>
  );
};