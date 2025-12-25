"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '../ui/spinner';

interface AdminProtectedProps {
  children: React.ReactNode;
}

export default function AdminProtected({ children }: AdminProtectedProps) {
  const { isAuth, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuth || user?.role !== 1)) {
      router.push('/');
    }
  }, [isAuth, user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!isAuth || user?.role !== 1) {
    return null;
  }

  return <>{children}</>;
}
