import { createContext, useContext, useState } from 'react';
import api from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const homeFor = (role) =>
  ({ ADMIN: '/admin', USER: '/stores', STORE_OWNER: '/owner' }[role] || '/login');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
