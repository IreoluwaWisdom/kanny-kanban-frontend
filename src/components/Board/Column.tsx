'use client';

import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType } from '@/context/BoardContext';
import { Card } from './Card';
import { Plus, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';

const getColumnColor = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('todo')) return 'bg-black';
  if (lowerName.includes('progress')) return 'bg-progress';
  if (lowerName.includes('complete')) return 'bg-completed';
  return 'bg-neutral-500';
};

const getColumnLabel = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('todo')) return 'to-do';
  if (lowerName.includes('progress')) return 'in-progress';
  if (lowerName.includes('complete')) return 'completed';
  return null;
};

interface ColumnProps {
  id: string;
  name: string;
  cards: CardType[];
  onAddCard: (columnId: string) => void;
  onUpdateColumn: (columnId: string, name: string) => void;
  isAddingCard?: boolean;
  isSavingCard?: boolean;
  onCancelAddCard?: () => void;
  onSaveCard?: (title: string, description: string) => void;
}

export function Column({ 
  id, 
  name, 
  cards, 
  onAddCard, 
  onUpdateColumn,
  isAddingCard = false,
  isSavingCard = false,
  onCancelAddCard,
  onSaveCard
}: ColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      type: 'column',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const cardTitleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isAddingCard && cardTitleRef.current) {
      cardTitleRef.current.focus();
    }
  }, [isAddingCard]);

  const handleSave = () => {
    if (editName.trim() && editName.trim() !== name) {
      onUpdateColumn(id, editName.trim());
    } else {
      setEditName(name);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSaveCard = () => {
    if (newCardTitle.trim() && onSaveCard) {
      onSaveCard(newCardTitle.trim(), newCardDescription.trim());
      setNewCardTitle('');
      setNewCardDescription('');
    }
  };

  const handleCancelCard = () => {
    setNewCardTitle('');
    setNewCardDescription('');
    if (onCancelAddCard) {
      onCancelAddCard();
    }
  };

  const columnLabel = getColumnLabel(name);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-80 bg-white rounded-lg p-4 flex flex-col border border-neutral-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className={`w-2 h-2 rounded-full ${getColumnColor(name)}`}></div>
          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="flex-1 px-2 py-1 text-lg font-semibold text-neutral-900 border border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary-500 hover:text-primary-600"
                onClick={handleSave}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-neutral-500 hover:text-neutral-600"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <h3 
                className="font-semibold text-lg text-neutral-900 cursor-pointer hover:text-primary-500 transition-colors flex items-center gap-2 group"
                onClick={() => setIsEditing(true)}
              >
                {name}
                <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              {columnLabel && (
                <span className="px-2 py-0.5 text-xs font-medium bg-neutral-100 text-neutral-600 rounded">
                  {columnLabel}
                </span>
              )}
              <span className="text-sm text-neutral-600">{cards.length}</span>
            </>
          )}
        </div>
      </div>

      <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
          {cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
          
          {/* Inline Add Card Form (Desktop) */}
          {isAddingCard && (
            <div className="bg-white border-2 border-primary-500 rounded-lg p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Task title</label>
                <Input
                  ref={cardTitleRef}
                  type="text"
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveCard();
                    } else if (e.key === 'Escape') {
                      handleCancelCard();
                    }
                  }}
                  className="w-full"
                  placeholder="Task title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">Type your message here</label>
                <textarea
                  value={newCardDescription}
                  onChange={(e) => setNewCardDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      handleCancelCard();
                    }
                  }}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Type your message here"
                />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-500 hover:text-neutral-600"
                  onClick={handleCancelCard}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  className="h-8 w-8 bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-70"
                  onClick={handleSaveCard}
                  disabled={!newCardTitle.trim() || isSavingCard}
                >
                  {isSavingCard ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SortableContext>

      {!isAddingCard && (
        <div className="mt-4 border-2 border-dashed border-neutral-300 rounded-lg p-3 text-center">
          <button
            onClick={() => onAddCard(id)}
            className="text-sm text-neutral-600 hover:text-primary-500 transition-colors"
          >
            Add card +
          </button>
        </div>
      )}
    </div>
  );
}
