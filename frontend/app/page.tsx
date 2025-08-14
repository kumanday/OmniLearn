'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { KnowledgeTreeForm } from '../components/KnowledgeTreeForm';
import KnowledgeTreeView from '../components/KnowledgeTreeView';
import GoogleLoginButton from './components/GoogleLoginButton';
import Link from 'next/link';

const queryClient = new QueryClient();

export default function Home() {
  const [activeTreeId, setActiveTreeId] = useState<number | null>(null);
  const [guestTree, setGuestTree] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const handleTreeCreated = (treeId: number) => {
    setActiveTreeId(treeId);
  };

  const handleGuestTreeCreated = (treeData: any) => {
    setGuestTree(treeData);
  };

  useEffect(() => {
    let token: string | null = null;
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('ol_jwt');
      if (!token) {
        try {
          const match = document.cookie.match(/(?:^|; )ol_jwt=([^;]+)/);
          token = match ? decodeURIComponent(match[1]) : null;
        } catch {}
      }
    }
    setIsAuthenticated(!!token);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary">OmniLearn</h1>
            <p className="text-xl text-gray-600 mt-2">Adaptive learning platform</p>
            <div className="flex flex-col items-center gap-3 mt-4">
              <div className="flex gap-3">
                <Link href="/auth/register" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Sign up</Link>
                <Link href="/auth/login" className="px-4 py-2 rounded border border-blue-600 text-blue-600 hover:bg-blue-50">Sign in</Link>
              </div>
              <div className="mt-2">
                <GoogleLoginButton clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''} onSuccess={() => {}} />
              </div>
              <Link href="/profile" className="text-primary underline">Go to my profile</Link>
            </div>
          </header>

          {/* Always show guest form when not authenticated */}
          {!isAuthenticated ? (
            !guestTree ? (
              <div>
                <p className="text-center text-gray-600 mb-4">Try the system without signing in:</p>
                <KnowledgeTreeForm 
                  guestMode={true} 
                  onSuccess={() => {}} 
                  onSuccessData={handleGuestTreeCreated} 
                />
              </div>
            ) : (
              <KnowledgeTreeView data={guestTree} guestMode={true} />
            )
          ) : (
            /* Authenticated users see the real API form */
            !activeTreeId ? (
              <KnowledgeTreeForm onSuccess={handleTreeCreated} />
            ) : (
              <KnowledgeTreeView treeId={activeTreeId} />
            )
          )}
        </div>
      </main>
    </QueryClientProvider>
  );
}