'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { KanbanBoard } from '@/components/Board/KanbanBoard';
import { Sidebar } from '@/components/layout/Sidebar';
import { useBoard } from '@/context/BoardContext';

export default function BoardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { currentBoard, loadCurrentBoard, loading: boardLoading, error } = useBoard();
  const router = useRouter();
  const hasLoadedRef = React.useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && !authLoading && !boardLoading && !currentBoard && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadCurrentBoard();
    }
  }, [isAuthenticated, authLoading, boardLoading, currentBoard, loadCurrentBoard]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (boardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              hasLoadedRef.current = false;
              loadCurrentBoard();
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-neutral-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-0">
        <KanbanBoard boardId={currentBoard.id} />
      </div>
    </div>
  );
}

