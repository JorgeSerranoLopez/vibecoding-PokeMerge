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
    e.dataTransfer.setData('sourceIndex', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    // Attempt to set a drag image (might be tricky with GIFs, browsers vary)
    const img = e.currentTarget.querySelector('img');
    if (img) {
      e.dataTransfer.setDragImage(img, 25, 25);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
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
        relative w-full h-24 sm:h-28 rounded-xl
        flex items-center justify-center transition-all duration-300
        group
        ${item 
          ? 'bg-emerald-700/80 shadow-[0_4px_0_0_rgba(6,78,59,1)] translate-y-0' 
          : 'bg-stone-800/40 border-2 border-stone-700/50 border-dashed'}
      `}
      style={{
         // Pseudo-3D effect
         transformStyle: 'preserve-3d',
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Grass/Floor Texture Overlay */}
      {item && <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-emerald-900/50 to-transparent pointer-events-none" />}

      {item && (
        <div
          draggable
          onDragStart={handleDragStart}
          className="w-full h-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:-translate-y-2 transition-transform duration-300 z-10"
        >
          {/* Shadow beneath pokemon */}
          <div className="absolute bottom-4 w-12 h-3 bg-black/40 rounded-[50%] blur-sm"></div>

          <img 
            src={item.image} 
            alt={item.name} 
            className="w-20 h-20 object-contain drop-shadow-lg pixelated relative z-20" 
            style={{ imageRendering: 'pixelated' }}
            draggable={false} 
          />
          <span className="text-[10px] uppercase font-bold text-emerald-100/80 tracking-wider absolute bottom-1 z-20 bg-emerald-900/50 px-1 rounded">
            {item.name}
          </span>
          <div className="absolute top-1 right-2 text-xs text-emerald-200/50 font-mono z-20">
            #{item.id}
          </div>
        </div>
      )}
    </div>
  );
};