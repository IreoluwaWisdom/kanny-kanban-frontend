'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Column } from './Column';
import { Card } from './Card';
import { Column as ColumnType, Card as CardType } from '@/context/BoardContext';
import { useBoard } from '@/context/BoardContext';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { KannyLogo } from '@/components/ui/logo';
import { useAuth } from '@/context/AuthContext';

interface KanbanBoardProps {
  boardId: string;
}

// Delete Column Component - Drop zone for deleting cards
function DeleteColumn() {
  const { setNodeRef, isOver } = useDroppable({
    id: 'delete-column',
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 flex items-center justify-center border-2 border-dashed rounded-lg transition-colors ${
        isOver
          ? 'border-error-400 bg-error-50'
          : 'border-neutral-300 bg-neutral-50'
      }`}
    >
      <div className="flex flex-col items-center gap-2 text-neutral-500">
        <Trash2 className="h-8 w-8" />
        <span className="text-sm font-medium">Drop here to delete</span>
      </div>
    </div>
  );
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const { currentBoard, moveCard, createCard, deleteCard, updateColumn } = useBoard();
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CardType | null>(null);
  const [addingCardColumnId, setAddingCardColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    if (active.data.current?.type === 'card') {
      setActiveCard(active.data.current.card);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveCard(null);

    if (!over || !currentBoard) return;

    const activeCardId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on delete column (special column for deletion)
    if (overId === 'delete-column') {
      // Show delete modal for card
      if (active.data.current?.type === 'card') {
        const card = active.data.current.card as CardType;
        setCardToDelete(card);
        setShowDeleteModal(true);
      }
      return;
    }

    // Find the card being dragged
    const card = currentBoard.columns
      .flatMap((col) => col.cards)
      .find((c) => c.id === activeCardId);

    if (!card) return;

    // Check if dropped on a column
    const targetColumn = currentBoard.columns.find((col) => col.id === overId);
    if (targetColumn) {
      // Dropped on a column - add to end
      await moveCard(activeCardId, targetColumn.id, targetColumn.cards.length);
      return;
    }

    // Check if dropped on another card
    const targetCard = currentBoard.columns
      .flatMap((col) => col.cards)
      .find((c) => c.id === overId);

    if (targetCard) {
      const targetColumn = currentBoard.columns.find((col) =>
        col.cards.some((c) => c.id === targetCard.id)
      );
      if (targetColumn) {
        const targetIndex = targetColumn.cards.findIndex((c) => c.id === targetCard.id);
        await moveCard(activeCardId, targetColumn.id, targetIndex);
      }
      return;
    }
  };

  const handleAddCard = async (columnId: string, title: string, description: string) => {
    if (title.trim()) {
      await createCard(columnId, title.trim(), description.trim() || undefined);
      setAddingCardColumnId(null);
    }
  };

  const openAddCardModal = (columnId: string) => {
    // On mobile, use modal. On desktop, use inline form
    if (window.innerWidth < 768) {
      setTargetColumnId(columnId);
      setShowAddCardModal(true);
    } else {
      setAddingCardColumnId(columnId);
    }
  };

  const handleCancelAddCard = () => {
    setAddingCardColumnId(null);
  };

  const handleModalAddCard = async () => {
    if (newCardTitle.trim() && targetColumnId) {
      await createCard(targetColumnId, newCardTitle.trim(), newCardDescription.trim() || undefined);
      setNewCardTitle('');
      setNewCardDescription('');
      setTargetColumnId(null);
      setShowAddCardModal(false);
    }
  };

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!currentBoard.columns || currentBoard.columns.length === 0) {
    return (
      <div className="flex-1 flex flex-col bg-neutral-100 overflow-hidden relative">
        <div className="bg-white border-b border-neutral-200 px-6 py-4 flex-shrink-0 w-full z-20 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KannyLogo size="md" />
              <h1 className="text-2xl font-bold text-neutral-900">{currentBoard?.name || 'Kanny'}</h1>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-neutral-600 mb-4">No columns found. The board is being set up...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const hasColumns = currentBoard.columns.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-neutral-100 overflow-hidden relative">
      {/* Header - Extends over sidebar */}
      <div className="bg-white border-b border-neutral-200 px-3 sm:px-4 md:px-6 py-3 md:py-4 flex-shrink-0 w-full z-20 relative">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <KannyLogo size="md" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 truncate">
              {currentBoard?.name || 'Kanny'}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <span className="text-xs sm:text-sm text-neutral-600 hidden sm:inline truncate max-w-[100px] md:max-w-none">
              {user?.name}
            </span>
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-300 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-neutral-700">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 sm:p-4 md:p-6 bg-neutral-100 min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 sm:gap-4 h-full min-w-max">
            <SortableContext
              items={currentBoard.columns?.map((col) => col.id) || []}
              strategy={horizontalListSortingStrategy}
            >
              {currentBoard.columns?.map((column) => (
                <Column
                  key={column.id}
                  id={column.id}
                  name={column.name}
                  cards={column.cards}
                  onAddCard={openAddCardModal}
                  onUpdateColumn={updateColumn}
                  isAddingCard={addingCardColumnId === column.id}
                  onCancelAddCard={handleCancelAddCard}
                  onSaveCard={(title, description) => handleAddCard(column.id, title, description)}
                />
              )) || []}
            </SortableContext>
            {/* Delete Column - Drop zone for deleting cards - Only show if columns exist */}
            {hasColumns && <DeleteColumn />}
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="bg-white p-4 rounded-lg shadow-lg w-64">
                <h4 className="font-medium text-gray-900 mb-1">{activeCard.title}</h4>
                {activeCard.description && (
                  <p className="text-sm text-gray-600">{activeCard.description}</p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Footer - Extends over sidebar */}
      <div className="w-full bg-white border-t border-neutral-200 px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-sm text-neutral-600 gap-2 flex-shrink-0 z-20">
        <div className="flex items-center gap-2">
          <KannyLogo size="sm" />
          <span>Kanny © 2025</span>
        </div>
        <span>Designed by 17/32</span>
      </div>

      {/* Add Card Modal (Mobile only) */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl mx-4">
            <h3 className="text-xl font-semibold mb-4">Add Card</h3>
            <input
              type="text"
              placeholder="Task title"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md mb-3"
              autoFocus
            />
            <textarea
              placeholder="Type your message here"
              value={newCardDescription}
              onChange={(e) => setNewCardDescription(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md mb-4 min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setShowAddCardModal(false);
                setNewCardTitle('');
                setNewCardDescription('');
                setTargetColumnId(null);
              }}>
                Close
              </Button>
              <Button onClick={handleModalAddCard} disabled={!newCardTitle.trim()}>
                Add +
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Card Modal */}
      {showDeleteModal && cardToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => {
          setShowDeleteModal(false);
          setCardToDelete(null);
        }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border-2 border-dashed border-error-400 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-neutral-900">Are you sure you want to delete this task?</h3>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCardToDelete(null);
                }}
                className="bg-neutral-100 text-neutral-700"
              >
                Close
              </Button>
              <Button
                onClick={async () => {
                  if (cardToDelete) {
                    await deleteCard(cardToDelete.id);
                    setShowDeleteModal(false);
                    setCardToDelete(null);
                  }
                }}
                className="bg-error-400 text-white hover:bg-error-400/90"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
