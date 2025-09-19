import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const decodedUser = jwtDecode(token);

        if (decodedUser.exp * 1000 > Date.now()) {
          setUser(decodedUser.user);
        } else {
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error("Invalid token found in localStorage", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const API_URL = 'https://crimeta1.onrender.com/auth/login';

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || 'Login failed');
    }

    if (data.token) {
      localStorage.setItem('authToken', data.token);
      const decodedUser = jwtDecode(data.token);
      setUser(decodedUser.user);
    }
    return data;
  };

  const register = async (userData) => {
    const API_URL = 'http://localhost:8080/auth/register/user';
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || 'Registration failed');
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };


  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
