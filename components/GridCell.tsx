import React from 'react';
import { GridItem } from '../types';

interface GridCellProps {
  index: number;
  item: GridItem;
  onDrop: (sourceIndex: number, targetIndex: number) => void;
}

export const GridCell: React.FC<GridCellProps> = ({ index, item, onDrop }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (!item) {
      e.preventDefault();
      return;
    }
    // Set the drag data to the index of the cell
    e.dataTransfer.setData('sourceIndex', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    // Add a ghost image visual effect (optional, browser default is usually okay)
    const img = e.currentTarget.querySelector('img');
    if (img) {
      e.dataTransfer.setDragImage(img, 50, 50);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('sourceIndex');
    if (sourceIndexStr) {
      const sourceIndex = parseInt(sourceIndexStr, 10);
      onDrop(sourceIndex, index);
    }
  };

  return (
    <div
      className={`
        relative w-full h-24 sm:h-28 rounded-xl border-2 
        flex items-center justify-center transition-all duration-200
        ${item 
          ? 'bg-slate-800 border-slate-600 shadow-md' 
          : 'bg-slate-800/50 border-slate-700 border-dashed'}
      `}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {item && (
        <div
          draggable
          onDragStart={handleDragStart}
          className="w-full h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
        >
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-20 h-20 object-contain drop-shadow-lg pixelated" 
            style={{ imageRendering: 'pixelated' }}
            draggable={false} // Prevent default image drag behavior, handle via parent div
          />
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider absolute bottom-1">
            {item.name}
          </span>
          <div className="absolute top-1 right-2 text-xs text-slate-600 font-mono">
            #{item.id}
          </div>
        </div>
      )}
    </div>
  );
};