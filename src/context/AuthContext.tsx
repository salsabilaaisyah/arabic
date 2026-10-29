import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { AppUser } from '../types';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithAdmin: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_STORAGE_KEY = 'ideaflow_admin_session';
const ADMIN_PASSWORD_TARGET = '21@prill2005';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check saved admin session on startup
  useEffect(() => {
    const savedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);
        setUser(parsed);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      }
    }

    // Subscribe to Firebase Auth changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      // If admin session is active in local state, do not overwrite unless signed out
      const currentAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (currentAdmin) {
        setLoading(false);
        return;
      }

      if (firebaseUser) {
        const isMasterEmail = firebaseUser.email === 'dinasalsa538@gmail.com';
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Pengguna',
          photoURL: firebaseUser.photoURL,
          role: isMasterEmail ? 'admin' : 'member',
          isCustomAdmin: false,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Login via Firebase Auth Popup
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      const result = await signInWithPopup(auth, googleProvider);
      const isMasterEmail = result.user.email === 'dinasalsa538@gmail.com';
      const appUser: AppUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email?.split('@')[0] || 'Pengguna',
        photoURL: result.user.photoURL,
        role: isMasterEmail ? 'admin' : 'member',
        isCustomAdmin: false,
      };
      setUser(appUser);
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Admin Login with credentials: username and password '21@prill2005'
  const loginWithAdmin = async (username: string, password: string) => {
    try {
      const cleanUsername = username.trim() || 'admin';

      // Call Express server-side endpoint if available, with direct fallback
      let verified = false;
      try {
        const res = await fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUsername, password }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            verified = true;
            const adminUser: AppUser = {
              uid: data.user.uid,
              email: data.user.email,
              displayName: data.user.displayName,
              role: 'admin',
              isCustomAdmin: true,
            };
            setUser(adminUser);
            localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
            return { success: true };
          }
        }
      } catch (err) {
        console.warn('Backend login endpoint unavailable, using local authentication verification');
      }

      // Local credential verification fallback
      if (password === ADMIN_PASSWORD_TARGET) {
        const adminUser: AppUser = {
          uid: 'admin_sys_' + Math.random().toString(36).substring(2, 9),
          email: cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@ideaflow.app`,
          displayName: `Admin (${cleanUsername})`,
          role: 'admin',
          isCustomAdmin: true,
        };
        setUser(adminUser);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminUser));
        return { success: true };
      } else {
        return { success: false, message: 'Password salah! Gunakan password: 21@prill2005' };
      }
    } catch (err) {
      return { success: false, message: 'Terjadi kesalahan saat memverifikasi login admin.' };
    }
  };

  // Logout handler
  const logout = async () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setUser(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign-out error:', e);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        loginWithGoogle,
        loginWithAdmin,
        logout,
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
