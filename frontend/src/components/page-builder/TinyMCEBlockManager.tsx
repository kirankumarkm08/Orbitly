'use client';

import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  GripVertical 
} from 'lucide-react';
import { TinyMCEBlock } from './TinyMCEBlock';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export interface Block {
  id: string;
  content: string;
}

export interface TinyMCEBlockManagerProps {
  initialBlocks?: Block[];
  onChange?: (blocks: Block[]) => void;
  className?: string;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export function TinyMCEBlockManager({
  initialBlocks = [{ id: generateId(), content: '' }],
  onChange,
  className
}: TinyMCEBlockManagerProps) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  const handleUpdate = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
    onChange?.(newBlocks);
  }, [onChange]);

  const addBlock = () => {
    handleUpdate([...blocks, { id: generateId(), content: '' }]);
  };

  const removeBlock = (id: string) => {
    if (blocks.length <= 1) return; // Keep at least one block
    handleUpdate(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    handleUpdate(newBlocks);
  };

  const handleBlockChange = (id: string, content: string) => {
    handleUpdate(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {blocks.map((block, index) => (
        <div key={block.id} className="group relative">
          {/* Block Controls */}
          <div className="absolute -left-12 top-0 bottom-0 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-4">
            <button
              onClick={() => moveBlock(index, 'up')}
              disabled={index === 0}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
              title="Move Up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <div className="p-1 cursor-grab active:cursor-grabbing">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            <button
              onClick={() => moveBlock(index, 'down')}
              disabled={index === blocks.length - 1}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
              title="Move Down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="mt-auto mb-4">
              <button
                onClick={() => removeBlock(block.id)}
                className="p-1 hover:bg-red-50 text-red-500 rounded"
                title="Delete Block"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <TinyMCEBlock
            initialContent={block.content}
            onChange={(content) => handleBlockChange(block.id, content)}
            placeholder={`Content section ${index + 1}...`}
          />
        </div>
      ))}

      <div className="flex justify-center py-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all">
        <Button
          variant="ghost"
          onClick={addBlock}
          className="flex items-center gap-2 text-gray-500 hover:text-primary"
        >
          <Plus className="w-4 h-4" />
          Add New Section
        </Button>
      </div>
    </div>
  );
}

export default TinyMCEBlockManager;
