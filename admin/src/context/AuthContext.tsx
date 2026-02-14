'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'admin';
}

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuration API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.15:5000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'admin est connecté et valider le token
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('adminToken');
      const storedUser = localStorage.getItem('adminUser');

      if (!storedToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        // Valider le token auprès du serveur
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.role === 'admin') {
            setUser(JSON.parse(storedUser));
          } else {
            // Pas un admin ou token invalide
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminToken');
          }
        } else {
          // Token expiré ou invalide
          localStorage.removeItem('adminUser');
          localStorage.removeItem('adminToken');
        }
      } catch {
        // Erreur réseau - garder la session locale pour l'instant
        setUser(JSON.parse(storedUser));
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // Appel API réel
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        return { success: false, error: data.message || 'Erreur de connexion' };
      }

      // Vérifier que c'est bien un admin
      if (data.data.role !== 'admin') {
        setIsLoading(false);
        return { success: false, error: 'Accès réservé aux administrateurs' };
      }

      // Stocker le token et les données utilisateur
      const adminUser: AdminUser = {
        id: data.data._id || data.data.id,
        email: data.data.email,
        nom: data.data.nom,
        prenom: data.data.prenom,
        role: 'admin',
      };

      setUser(adminUser);
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      localStorage.setItem('adminToken', data.token);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
