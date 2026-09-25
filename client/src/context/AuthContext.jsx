import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    name: localStorage.getItem('xor_username') || 'Developer',
    email: 'user@xor.local',
  });

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || { user: null, isAuthenticated: true };
};
