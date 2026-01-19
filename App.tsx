import React, { useState, useEffect, useCallback } from 'react';
import { EVOLUTION_RULES, SPAWNABLE_IDS, TOTAL_CELLS, POKEBALL_COST, INCOME_MAP } from './constants';
import { GridItem } from './types';
import { fetchPokemonData } from './services/pokemonService';
import { GridCell } from './components/GridCell';

const App: React.FC = () => {
  const [grid, setGrid] = useState<GridItem[]>(Array(TOTAL_CELLS).fill(null));
  const [score, setScore] = useState<number>(0);
  const [evoStones, setEvoStones] = useState<number>(0);
  const [incomeRate, setIncomeRate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<string>("Welcome to the Ranch!");
  
  // Calculate income rate whenever grid changes
  useEffect(() => {
    const rate = grid.reduce((acc, item) => {
      if (!item) return acc;
      return acc + (INCOME_MAP[item.id] || 0);
    }, 0);
    setIncomeRate(rate);
  }, [grid]);

  // Passive Income Loop
  useEffect(() => {
    if (incomeRate === 0) return;
    
    const timer = setInterval(() => {
      setEvoStones(prev => prev + incomeRate);
    }, 1000);

    return () => clearInterval(timer);
  }, [incomeRate]);

  const spawnPokemon = useCallback(async (isAuto = false) => {
    setGrid(currentGrid => {
      // Find empty indices logic only to prepare state
      const emptyIndices = currentGrid
        .map((item, index) => (item === null ? index : -1))
        .filter(index => index !== -1);

      if (emptyIndices.length === 0) {
        if (isAuto) return currentGrid; 
        return currentGrid;
      }
      return currentGrid;
    });

    const emptyIndices = grid
      .map((item, index) => (item === null ? index : -1))
      .filter(index => index !== -1);
    
    if (emptyIndices.length === 0) {
        if (!isAuto) setLastEvent("Ranch is full!");
        return;
    }

    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const randomId = SPAWNABLE_IDS[Math.floor(Math.random() * SPAWNABLE_IDS.length)];

    try {
      const data = await fetchPokemonData(randomId);
      if (data) {
        setGrid(prev => {
          if (prev[randomIndex] !== null) return prev; 
          const newGrid = [...prev];
          newGrid[randomIndex] = data;
          return newGrid;
        });
        if (!isAuto) setLastEvent("New Pokémon arrived!");
      }
    } catch (e) {
      console.error("Failed to spawn", e);
    }
  }, [grid]);

  // REMOVED: Auto Spawn (Wild Encounters) useEffect
  // Pokemon now only spawn when bought.

  // Initial spawn - Keep this so the board isn't empty on load
  useEffect(() => {
    spawnPokemon(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBuyPokeball = () => {
    if (evoStones >= POKEBALL_COST) {
      setEvoStones(prev => prev - POKEBALL_COST);
      spawnPokemon(false);
    } else {
      setLastEvent(`Need ${POKEBALL_COST} Evo Stones!`);
    }
  };

  const handleDrop = async (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex) return;

    const sourceItem = grid[sourceIndex];
    const targetItem = grid[targetIndex];

    if (!sourceItem) return;

    // Case 1: Move to empty slot
    if (!targetItem) {
      setGrid(prev => {
        const newGrid = [...prev];
        newGrid[targetIndex] = sourceItem;
        newGrid[sourceIndex] = null;
        return newGrid;
      });
      return;
    }

    // Case 2: Merge (Evolution)
    if (sourceItem.id === targetItem.id) {
      const nextEvolutionId = EVOLUTION_RULES[sourceItem.id];

      if (nextEvolutionId) {
        setLoading(true);
        try {
          const newPokemon = await fetchPokemonData(nextEvolutionId);
          if (newPokemon) {
            setGrid(prev => {
              const newGrid = [...prev];
              newGrid[targetIndex] = newPokemon;
              newGrid[sourceIndex] = null;
              return newGrid;
            });
            setScore(prev => prev + (nextEvolutionId * 10)); 
            setLastEvent(`Evolved into ${newPokemon.name}!`);
          }
        } catch (error) {
          console.error("Evolution failed", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLastEvent("Maximum Evolution!");
      }
    } else {
      setLastEvent("Not a match!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-sky-400 to-green-300 p-4 font-sans select-none overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-green-600 to-green-400"></div>
        {/* Clouds */}
        <div className="absolute top-10 left-10 w-20 h-10 bg-white/40 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-20 right-20 w-32 h-12 bg-white/30 rounded-full blur-xl animate-pulse delay-700"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)] tracking-tight">
          Poké<span className="text-yellow-300">Ranch</span>
        </h1>
        <p className="text-green-900 font-semibold text-sm md:text-base bg-white/30 backdrop-blur-sm py-1 px-4 rounded-full inline-block mt-2">
          Collect, Merge, and Evolve your 3D Herd!
        </p>
      </div>

      {/* Stats Bar */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 w-full max-w-2xl bg-white/80 p-4 rounded-3xl border-4 border-green-700/30 shadow-xl backdrop-blur-md">
        
        {/* Score */}
        <div className="flex flex-col pl-2">
          <span className="text-xs text-green-800 font-bold uppercase tracking-widest">Score</span>
          <span className="text-2xl font-black text-green-900 font-mono">{score.toLocaleString()}</span>
        </div>

        {/* Evo Stones Economy */}
        <div className="flex flex-col md:items-center">
           <span className="text-xs text-green-800 font-bold uppercase tracking-widest flex items-center gap-1">
             Evo Stones
             <span className="text-green-600 text-[10px] animate-pulse">(+{incomeRate}/s)</span>
           </span>
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 shadow-lg flex items-center justify-center text-[10px] border border-white">
               💎
             </div>
             <span className="text-2xl font-black text-purple-900 font-mono">{evoStones.toLocaleString()}</span>
           </div>
        </div>

        {/* Status Message */}
        <div className="flex flex-col items-end col-span-2 md:col-span-1 md:items-end pr-2">
           <span className="text-xs text-green-800 font-bold uppercase tracking-widest">Ranch News</span>
           <span className="text-sm font-bold text-orange-600 truncate w-full text-right animate-pulse">
             {loading ? 'Evolving...' : lastEvent}
           </span>
        </div>
      </div>

      {/* 3D Grid Container */}
      <div 
        className="relative z-10 p-6 md:p-8 rounded-3xl bg-green-800/20 border-b-8 border-green-900/10 shadow-2xl backdrop-blur-sm mb-6 transition-all duration-500"
        style={{
            perspective: '1000px',
        }}
      >
        <div 
            className="grid grid-cols-4 gap-2 md:gap-4"
            style={{
                transform: 'rotateX(20deg)', // The 3D tilt
                transformStyle: 'preserve-3d',
            }}
        >
            {grid.map((item, index) => (
            <GridCell 
                key={index} 
                index={index} 
                item={item} 
                onDrop={handleDrop} 
            />
            ))}
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex gap-4">
        <button
          onClick={handleBuyPokeball}
          disabled={loading || evoStones < POKEBALL_COST}
          className="
            group relative
            px-8 py-4 bg-gradient-to-b from-red-500 to-red-600 
            hover:from-red-400 hover:to-red-500
            active:from-red-600 active:to-red-700
            text-white font-bold rounded-full 
            shadow-[0_8px_0_0_rgb(153,27,27)] hover:shadow-[0_6px_0_0_rgb(153,27,27)] active:shadow-none
            transition-all 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
            flex items-center gap-3 border-2 border-red-800
            transform active:translate-y-2
          "
        >
          {/* Pokeball Icon */}
          <div className="w-10 h-10 rounded-full bg-white border-4 border-slate-900 relative overflow-hidden flex items-center justify-center animate-bounce group-hover:animate-spin">
            <div className="absolute top-0 w-full h-1/2 bg-red-600 border-b-4 border-slate-900"></div>
            <div className="w-3 h-3 rounded-full bg-white border-4 border-slate-900 z-10"></div>
          </div>
          
          <div className="flex flex-col items-start leading-tight">
            <span className="uppercase text-xs text-red-100 font-bold tracking-wider text-shadow-sm">Order Delivery</span>
            <span className="text-xl font-black font-mono flex items-center gap-1 text-white drop-shadow-md">
               {POKEBALL_COST} <span className="text-sm">💎</span>
            </span>
          </div>
        </button>
      </div>
      
      {/* Footer Instructions */}
      <div className="relative z-10 mt-8 text-center text-green-900/60 font-semibold text-xs hover:opacity-100 transition-opacity">
        <p>Merge identical Pokémon to evolve.</p>
        <p>Charizard + Charizard = Cyndaquil (Next Gen!)</p>
      </div>

    </div>
  );
};

export default App;