import axios from 'axios';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:5000/api/auth';

const hasToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};

const getUser = (): any => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export async function login(username: string, password: string): Promise<any> {
  const response = await axios.post(`${API_URL}/login`, { username, password });
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(hasToken());
  const [user, setUser] = useState<any>(getUser());

  useEffect(() => {
    // Sync state
    setIsAuthenticated(hasToken());
    setUser(getUser());

    const handleStorageChange = () => {
      setIsAuthenticated(hasToken());
      setUser(getUser());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { isAuthenticated, user };
}
