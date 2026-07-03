import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = () => {
    try {
      const isLoggedIn = localStorage.getItem('wellmora_admin_logged_in') === 'true';
      if (isLoggedIn) {
        const savedName = localStorage.getItem('wellmora_admin_name') || 'Chief Enterprise Admin';
        const savedEmail = localStorage.getItem('wellmora_admin_email') || 'admin@wellmora.com';
        setUser({
          _id: 'admin_1',
          name: savedName,
          email: savedEmail,
          role: 'admin'
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    // Simulate short loader delay for realistic login feedback
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email.toLowerCase() === 'admin@wellmora.com' && password === 'admin123') {
          const savedName = localStorage.getItem('wellmora_admin_name') || 'Chief Enterprise Admin';
          const savedEmail = localStorage.getItem('wellmora_admin_email') || 'admin@wellmora.com';
          const adminUser = {
            _id: 'admin_1',
            name: savedName,
            email: savedEmail,
            role: 'admin'
          };
          localStorage.setItem('wellmora_admin_logged_in', 'true');
          setUser(adminUser);
          setLoading(false);
          resolve({ success: true, user: adminUser });
        } else {
          const errorMsg = 'Invalid security credentials';
          setError(errorMsg);
          setLoading(false);
          resolve({ success: false, error: errorMsg });
        }
      }, 800);
    });
  };

  const updateProfile = (name, email) => {
    localStorage.setItem('wellmora_admin_name', name);
    localStorage.setItem('wellmora_admin_email', email);
    setUser((prev) => (prev ? { ...prev, name, email } : null));
  };

  const logout = async () => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('wellmora_admin_logged_in');
        setUser(null);
        setLoading(false);
        resolve();
      }, 500);
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, checkAuth, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
