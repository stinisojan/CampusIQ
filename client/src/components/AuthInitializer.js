'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export default function AuthInitializer({ children }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}