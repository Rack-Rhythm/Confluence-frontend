import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/auth';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = {
  citizen: {
    email: 'citizen@jharkhand.in',
    password: 'Password@123',
    role: 'citizen',
    label: 'Citizen (Rameshwar Munda)',
  },
  student: {
    email: 'student1@bitsindri.ac.in',
    password: 'Password@123',
    role: 'student',
    label: 'Student (Priya Sharma - BIT)',
  },
  coordinator: {
    email: 'coordinator@bitsindri.ac.in',
    password: 'Password@123',
    role: 'university_coordinator',
    label: 'Univ. Coordinator (Prof. Soren)',
  },
  mentor: {
    email: 'mentor@bitsindri.ac.in',
    password: 'Password@123',
    role: 'faculty_mentor',
    label: 'Faculty Mentor (Dr. A.K. Singh)',
  },
  gov_admin: {
    email: 'admin@jharkhand.gov.in',
    password: 'Password@123',
    role: 'gov_admin',
    label: 'Gov Admin (Director HTE)',
  },
  industry: {
    email: 'csr@tatasteel.com',
    password: 'Password@123',
    role: 'industry_partner',
    label: 'Industry CSR (Tata Steel)',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await authAPI.getProfile();
      setUser(profile);
      localStorage.setItem('user_data', JSON.stringify(profile));
    } catch (err) {
      console.warn('Profile sync issue:', err);
      // If token expired and couldn't be refreshed
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await authAPI.login(email, password);
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      
      // Fetch full profile to ensure all FK objects/details are populated
      const profile = await authAPI.getProfile();
      setUser(profile);
      localStorage.setItem('user_data', JSON.stringify(profile));
      showToast(`Welcome back, ${profile.name || profile.email}!`, 'success');
      return profile;
    } catch (error) {
      const msg = error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Invalid credentials.';
      showToast(msg, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const profile = await authAPI.register(userData);
      showToast('Registration successful! Please sign in.', 'success');
      return profile;
    } catch (error) {
      const errors = error.response?.data;
      let msg = 'Registration failed.';
      if (typeof errors === 'object' && errors !== null) {
        msg = Object.entries(errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(' | ');
      }
      showToast(msg, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (demoKey) => {
    const account = DEMO_ACCOUNTS[demoKey];
    if (!account) return;
    return await login(account.email, account.password);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
    showToast('Signed out successfully.', 'info');
  };

  const updateProfile = async (data) => {
    try {
      const updated = await authAPI.updateProfile(data);
      setUser(updated);
      localStorage.setItem('user_data', JSON.stringify(updated));
      showToast('Profile updated successfully!', 'success');
      return updated;
    } catch (err) {
      showToast('Failed to update profile.', 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        demoLogin,
        logout,
        refreshProfile: loadProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
