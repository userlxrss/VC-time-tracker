'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { useState, useEffect } from 'react';
import "./globals.css";
import { getTheme, setTheme, getCurrentUserId } from '@/lib/storage';
import { dataSyncManager } from '@/lib/data-integration';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Initialize theme
    const savedTheme = getTheme();
    setTheme(savedTheme);

    // Initialize data sync manager for real-time updates across tabs
    const handleDataSync = (event: any) => {
      console.log('Data sync event:', event.type);
    };
    dataSyncManager.addListener(handleDataSync);

    // Set up cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('vc_')) {
        // Sync data across tabs
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      dataSyncManager.removeListener(handleDataSync);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div id="root">
          {mounted ? children : null}
        </div>
        <div id="toast-root" />
        <div id="modal-root" />
      </body>
    </html>
  );
}