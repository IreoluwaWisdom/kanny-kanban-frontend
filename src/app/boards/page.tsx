'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useBoard } from '@/context/BoardContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, LogOut, Kanban } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from '@/components/layout/Sidebar';

export default function BoardsPage() {
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const { boards, loadBoards, createBoard, loading: boardsLoading, error: boardsError } = useBoard();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const hasLoadedRef = useRef(false);
  
  useEffect(() => {
    if (isAuthenticated && !boardsLoading && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadBoards();
    }
  }, [isAuthenticated, boardsLoading, loadBoards]);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    
    setIsCreating(true);
    try {
      const newBoard = await createBoard(newBoardName.trim());
      setShowCreateModal(false);
      setNewBoardName('');
      router.push(`/boards/${newBoard.id}`);
    } catch (error) {
      console.error('Failed to create board:', error);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (showCreateModal && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCreateModal]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

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

  return (
    <div className="h-screen flex bg-neutral-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-neutral-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 bg-black rounded-full"></div>
                <div className="absolute inset-0 bg-black rounded-full translate-x-1 translate-y-1"></div>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">Kanny</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600">{user?.name}</span>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center">
                  <span className="text-xs font-semibold text-neutral-700">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-neutral-900">My Boards</h2>
          <Button onClick={() => setShowCreateModal(true)} disabled={boardsLoading} className="bg-primary-500 hover:bg-primary-600">
            <Plus className="h-4 w-4 mr-2" />
            Create Board
          </Button>
        </div>

        {/* Create Board Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-xl font-semibold mb-4">Create New Board</h3>
              <Input
                ref={inputRef}
                type="text"
                placeholder="Enter board name"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateBoard();
                  if (e.key === 'Escape') {
                    setShowCreateModal(false);
                    setNewBoardName('');
                  }
                }}
                disabled={isCreating}
                className="mb-4"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewBoardName('');
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateBoard} disabled={isCreating || !newBoardName.trim()}>
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {boardsError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">Error: {boardsError}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => loadBoards()}
            >
              Retry
            </Button>
          </div>
        )}
        {boardsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading boards...</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="text-center py-12">
            <Kanban className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No boards yet</h3>
            <p className="text-muted-foreground mb-4">Create your first board to get started</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Board
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {boards.map((board) => (
              <Link key={board.id} href={`/boards/${board.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-32 bg-white border border-neutral-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-neutral-900">{board.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-600">
                      Created {new Date(board.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
          </div>
        </div>

        {/* Footer */}
        <div className="w-full bg-white border-t border-neutral-200 px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-sm text-neutral-600 gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6">
              <div className="absolute inset-0 bg-black rounded-full"></div>
              <div className="absolute inset-0 bg-black rounded-full translate-x-0.5 translate-y-0.5"></div>
            </div>
            <span>Kanny © 2025</span>
          </div>
          <span>Designed by 17/32</span>
        </div>
      </div>
    </div>
  );
}

