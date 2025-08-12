'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { KnowledgeTreeForm } from '../components/KnowledgeTreeForm';
import KnowledgeTreeView from '../components/KnowledgeTreeView';

const queryClient = new QueryClient();

export default function Home() {
  const [activeTreeId, setActiveTreeId] = useState<number | null>(null);

  const handleTreeCreated = (treeId: number) => {
    setActiveTreeId(treeId);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary">OmniLearn</h1>
            <p className="text-xl text-gray-600 mt-2">Adaptive Learning Platform</p>
          </header>

          {!activeTreeId ? (
            <KnowledgeTreeForm onSuccess={handleTreeCreated} />
          ) : (
            <KnowledgeTreeView treeId={activeTreeId} />
          )}
        </div>
      </main>
    </QueryClientProvider>
  );
}