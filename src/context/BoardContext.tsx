'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api, ApiError } from '@/lib/api';
import { getUserFriendlyError } from '@/lib/errorMessages';
import { logger } from '@/lib/logger';

export interface Card {
  id: string;
  title: string;
  description: string | null;
  columnId: string;
  position: number;
}

export interface Column {
  id: string;
  name: string;
  boardId: string;
  position: number;
  cards: Card[];
}

export interface Board {
  id: string;
  name: string;
  userId: string;
  columns: Column[];
}

interface BoardContextType {
  currentBoard: Board | null;
  boards: Array<{ id: string; name: string; userId: string; createdAt: string }>;
  loading: boolean;
  error: string | null;
  setCurrentBoard: (board: Board | null) => void;
  loadBoards: () => Promise<void>;
  loadBoard: (boardId: string) => Promise<void>;
  loadCurrentBoard: () => Promise<void>;
  createBoard: (name: string) => Promise<{ id: string; name: string; userId: string; createdAt: string }>;
  updateBoard: (boardId: string, name: string) => Promise<void>;
  deleteBoard: (boardId: string) => Promise<void>;
  createColumn: (boardId: string, name: string) => Promise<void>;
  updateColumn: (columnId: string, name: string) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  createCard: (columnId: string, title: string, description?: string) => Promise<void>;
  updateCard: (cardId: string, title: string, description?: string) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  moveCard: (cardId: string, columnId: string, position: number) => Promise<void>;
  currentBoard: Board | null;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [boards, setBoards] = useState<Array<{ id: string; name: string; userId: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBoards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      logger.log('Loading boards...');
      const data = await api.getBoards();
      logger.log('Boards loaded:', data);
      setBoards(data);
    } catch (err) {
      const apiError = err as ApiError;
      logger.error('Error loading boards:', apiError);
      setError(getUserFriendlyError(apiError.message || 'Failed to load boards'));
    } finally {
      setLoading(false);
    }
  }, []); // Empty deps - function doesn't depend on any state/props

  const loadBoard = useCallback(async (boardId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBoard(boardId);
      setCurrentBoard(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(getUserFriendlyError(apiError.message || 'Failed to load board'));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCurrentBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCurrentBoard();
      logger.log('Board loaded:', data);
      logger.log('Columns:', data.columns);
      setCurrentBoard(data);
    } catch (err) {
      const apiError = err as ApiError;
      logger.error('Error loading board:', apiError);
      setError(getUserFriendlyError(apiError.message || 'Failed to load board'));
    } finally {
      setLoading(false);
    }
  }, []);

  const createBoard = useCallback(async (name: string) => {
    setError(null);
    try {
      const newBoard = await api.createBoard(name);
      setBoards(prev => [...prev, newBoard]);
      return newBoard;
    } catch (err) {
      const apiError = err as ApiError;
      setError(getUserFriendlyError(apiError.message || 'Failed to create board'));
      throw err;
    }
  }, []);

  const updateBoard = async (boardId: string, name: string) => {
    setError(null);
    try {
      await api.updateBoard(boardId, name);
      setBoards(boards.map(b => b.id === boardId ? { ...b, name } : b));
      if (currentBoard?.id === boardId) {
        setCurrentBoard({ ...currentBoard, name });
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(getUserFriendlyError(apiError.message || 'Failed to update board'));
      throw err;
    }
  };

  const deleteBoard = async (boardId: string) => {
    setError(null);
    try {
      await api.deleteBoard(boardId);
      setBoards(boards.filter(b => b.id !== boardId));
      if (currentBoard?.id === boardId) {
        setCurrentBoard(null);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(getUserFriendlyError(apiError.message || 'Failed to delete board'));
      throw err;
    }
  };

  const createColumn = async (boardId: string, name: string) => {
    setError(null);
    try {
      const newColumn = await api.createColumn(boardId, name);
      if (currentBoard?.id === boardId) {
        setCurrentBoard({
          ...currentBoard,
          columns: [...currentBoard.columns, { ...newColumn, cards: [] }],
        });
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(getUserFriendlyError(apiError.message || 'Failed to create column'));
      throw err;
    }
  };

  const updateColumn = async (columnId: string, name: string) => {
    setError(null);
    try {
      await api.updateColumn(columnId, name);
      if (currentBoard) {
        setCurrentBoard({
          ...currentBoard,
          columns: currentBoard.columns.map(c =>
            c.id === columnId ? { ...c, name } : c
          ),
        });
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(getUserFriendlyError(apiError.message || 'Failed to update column'));
      throw err;
    }
  };

  const deleteColumn = async (columnId: string) => {
    setError(null);
    try {
      await api.deleteColumn(columnId);
      if (currentBoard) {
        setCurrentBoard({
          ...currentBoard,
          columns: currentBoard.columns.filter(c => c.id !== columnId),
        });
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(getUserFriendlyError(apiError.message || 'Failed to delete column'));
      throw err;
    }
  };

  const createCard = async (columnId: string, title: string, description?: string) => {
    setError(null);
    try {
      const newCard = await api.createCard(columnId, title, description);
      if (currentBoard) {
        setCurrentBoard({
          ...currentBoard,
          columns: currentBoard.columns.map(c =>
            c.id === columnId
              ? { ...c, cards: [...c.cards, newCard] }
              : c
          ),
        });
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(getUserFriendlyError(apiError.message || 'Failed to create card'));
      throw err;
    }
  };

  const updateCard = async (cardId: string, title: string, description?: string) => {
    setError(null);
    try {
      await api.updateCard(cardId, title, description);
      if (currentBoard) {
        setCurrentBoard({
          ...currentBoard,
          columns: currentBoard.columns.map(c => ({
            ...c,
            cards: c.cards.map(card =>
              card.id === cardId
                ? { ...card, title, description: description ?? null }
                : card
            ),
          })),
        });
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(getUserFriendlyError(apiError.message || 'Failed to update card'));
      throw err;
    }
  };

  const deleteCard = async (cardId: string) => {
    setError(null);
    try {
      await api.deleteCard(cardId);
      if (currentBoard) {
        setCurrentBoard({
          ...currentBoard,
          columns: currentBoard.columns.map(c => ({
            ...c,
            cards: c.cards.filter(card => card.id !== cardId),
          })),
        });
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(getUserFriendlyError(apiError.message || 'Failed to delete card'));
      throw err;
    }
  };

  const moveCard = async (cardId: string, columnId: string, position: number) => {
    setError(null);
    try {
      // Optimistic update
      if (currentBoard) {
        const card = currentBoard.columns
          .flatMap(c => c.cards)
          .find(c => c.id === cardId);
        
        if (card) {
          const oldColumnId = card.columnId;
          const newColumn = currentBoard.columns.find(c => c.id === columnId);
          const oldColumn = currentBoard.columns.find(c => c.id === oldColumnId);

          if (newColumn && oldColumn) {
            // Remove from old column
            const updatedOldColumn = {
              ...oldColumn,
              cards: oldColumn.cards
                .filter(c => c.id !== cardId)
                .map((c, idx) => ({ ...c, position: idx })),
            };

            // Add to new column at position
            const updatedNewColumn = {
              ...newColumn,
              cards: [
                ...newColumn.cards.slice(0, position),
                { ...card, columnId, position },
                ...newColumn.cards.slice(position).map((c, idx) => ({
                  ...c,
                  position: position + idx + 1,
                })),
              ],
            };

            setCurrentBoard({
              ...currentBoard,
              columns: currentBoard.columns.map(c =>
                c.id === oldColumnId
                  ? updatedOldColumn
                  : c.id === columnId
                  ? updatedNewColumn
                  : c
              ),
            });
          }
        }
      }

      await api.moveCard(cardId, columnId, position);
      
      // Reload board to ensure consistency
      if (currentBoard) {
        await loadBoard(currentBoard.id);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(getUserFriendlyError(apiError.message || 'Failed to move card'));
      // Reload board on error to revert optimistic update
      if (currentBoard) {
        await loadBoard(currentBoard.id);
      }
      throw err;
    }
  };

  return (
    <BoardContext.Provider
      value={{
        currentBoard,
        boards,
        loading,
        error,
        setCurrentBoard,
        loadBoards,
        loadBoard,
        loadCurrentBoard,
        createBoard,
        updateBoard,
        deleteBoard,
        createColumn,
        updateColumn,
        deleteColumn,
        createCard,
        updateCard,
        deleteCard,
        moveCard,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
}

