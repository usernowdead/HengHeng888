"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '../ui/spinner';

interface PublicProtectedProps {
  children: React.ReactNode;
}

export default function PublicProtected({ children }: PublicProtectedProps) {
  const { isAuth, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuth) {
      router.push('/');
    }
  }, [isAuth, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (isAuth) {
    return null;
  }

  return <>{children}</>;
}
