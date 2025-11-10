'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType } from '@/context/BoardContext';
import { Card as UICard } from '@/components/ui/card';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { useBoard } from '@/context/BoardContext';
import { Input } from '@/components/ui/input';

interface CardProps {
  card: CardType;
}

const STATUS_OPTIONS = [
  { value: 'to-do', label: 'to-do', color: 'bg-black' },
  { value: 'in-progress', label: 'in-progress', color: 'bg-progress' },
  { value: 'completed', label: 'completed', color: 'bg-completed' },
];

export function Card({ card }: CardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const { deleteCard, updateCard, moveCard, currentBoard } = useBoard();
  const [showDelete, setShowDelete] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');
  const [editStatus, setEditStatus] = useState(card.columnId);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const touchStartRef = useRef<number | null>(null);
  const touchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get current status from column name
  const getCurrentStatus = () => {
    if (!currentBoard) return 'to-do';
    const column = currentBoard.columns.find(c => c.id === card.columnId);
    if (!column) return 'to-do';
    const lowerName = column.name.toLowerCase();
    if (lowerName.includes('todo')) return 'to-do';
    if (lowerName.includes('progress')) return 'in-progress';
    if (lowerName.includes('complete')) return 'completed';
    return 'to-do';
  };

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
    setEditStatus(card.columnId);
  }, [isEditing, card.columnId]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteCard(card.id);
    setShowDeleteModal(false);
  };

  const handleSave = async () => {
    if (editTitle.trim()) {
      const titleChanged = editTitle.trim() !== card.title;
      const descriptionChanged = editDescription.trim() !== (card.description || '');
      const statusChanged = editStatus !== card.columnId;

      if (titleChanged || descriptionChanged) {
        await updateCard(card.id, editTitle.trim(), editDescription.trim() || undefined);
      }

      if (statusChanged) {
        // Find target column and move card to end
        if (currentBoard) {
          const targetColumn = currentBoard.columns.find(c => c.id === editStatus);
          if (targetColumn) {
            await moveCard(card.id, editStatus, targetColumn.cards.length);
          }
        }
      }
    } else {
      setEditTitle(card.title);
      setEditDescription(card.description || '');
      setEditStatus(card.columnId);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(card.title);
    setEditDescription(card.description || '');
    setEditStatus(card.columnId);
    setIsEditing(false);
  };

  // Handle mobile double tap / long press
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditing) return;
    const now = Date.now();
    if (touchStartRef.current && now - touchStartRef.current < 300) {
      // Double tap detected
      e.preventDefault();
      setShowDeleteModal(true);
    } else {
      touchStartRef.current = now;
      // Long press detection
      touchTimerRef.current = setTimeout(() => {
        setShowDeleteModal(true);
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
      }
    };
  }, []);

  // Get column for status dropdown
  const getStatusColumns = () => {
    if (!currentBoard) return [];
    return currentBoard.columns.map(col => {
      const lowerName = col.name.toLowerCase();
      let status = 'to-do';
      if (lowerName.includes('todo')) status = 'to-do';
      else if (lowerName.includes('progress')) status = 'in-progress';
      else if (lowerName.includes('complete')) status = 'completed';
      
      return {
        id: col.id,
        name: col.name,
        status,
      };
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative group"
    >
      <UICard
        className={`p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-white border border-neutral-200 ${isEditing ? 'border-primary-500' : ''}`}
        {...(!isEditing ? { ...attributes, ...listeners } : {})}
      >
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Task title</label>
              <Input
                ref={titleInputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSave();
                  } else if (e.key === 'Escape') {
                    handleCancel();
                  }
                }}
                className="w-full"
                placeholder="Task title"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Type your message here</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    handleCancel();
                  }
                }}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Type your message here"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {getStatusColumns().map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-500 hover:text-neutral-600"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="h-8 w-8 bg-primary-500 hover:bg-primary-600 text-white"
                onClick={handleSave}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1" onClick={() => setIsEditing(true)}>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-neutral-900 cursor-pointer hover:text-primary-500 transition-colors">
                  {card.title}
                </h4>
                <Pencil className="h-4 w-4 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {card.description && (
                <p className="text-sm text-neutral-600 line-clamp-3 mt-2">{card.description}</p>
              )}
            </div>
            {showDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-error-400 hover:text-error-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </UICard>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border-2 border-dashed border-error-400 mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-neutral-900">Are you sure you want to delete this task?</h3>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="bg-neutral-100 text-neutral-700"
              >
                Close
              </Button>
              <Button
                onClick={confirmDelete}
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
