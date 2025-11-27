'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vc-primary-50 to-vc-accent-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vc-primary-600"></div>
    </div>
  );
}