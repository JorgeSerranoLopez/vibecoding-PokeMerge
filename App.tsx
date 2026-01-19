import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EVOLUTION_RULES, SPAWNABLE_IDS, TOTAL_CELLS, SPAWN_INTERVAL_MS, POKEBALL_COST, INCOME_MAP } from './constants';
import { GridItem } from './types';
import { fetchPokemonData } from './services/pokemonService';
import { GridCell } from './components/GridCell';

const App: React.FC = () => {
  const [grid, setGrid] = useState<GridItem[]>(Array(TOTAL_CELLS).fill(null));
  const [score, setScore] = useState<number>(0);
  const [evoStones, setEvoStones] = useState<number>(0);
  const [incomeRate, setIncomeRate] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<string>("Welcome! Drag matching Pokémon to evolve.");
  
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
      // Find empty indices logic only to prepare state, actual fetch is below
      const emptyIndices = currentGrid
        .map((item, index) => (item === null ? index : -1))
        .filter(index => index !== -1);

      if (emptyIndices.length === 0) {
        if (isAuto) {
            // Silently fail for auto spawn if full
            return currentGrid; 
        }
        // User action fail handled in caller or generic handling
        return currentGrid;
      }
      return currentGrid;
    });

    const emptyIndices = grid
      .map((item, index) => (item === null ? index : -1))
      .filter(index => index !== -1);
    
    if (emptyIndices.length === 0) {
        if (!isAuto) setLastEvent("Grid is full!");
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
        if (!isAuto) setLastEvent("New Pokémon appeared!");
      }
    } catch (e) {
      console.error("Failed to spawn", e);
    }
  }, [grid]);

  // Game Loop: Auto Spawn (Wild Encounters)
  useEffect(() => {
    const intervalId = setInterval(() => {
      spawnPokemon(true);
    }, SPAWN_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [spawnPokemon]);

  // Initial spawn
  useEffect(() => {
    spawnPokemon(true);
    setTimeout(() => spawnPokemon(true), 500);
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
        setLastEvent("Max evolution reached!");
      }
    } else {
      setLastEvent("Those Pokemon don't match!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 font-sans select-none">
      
      {/* Header */}
      <div className="text-center mb-4 md:mb-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 mb-2 drop-shadow-md">
          PokéMerge
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Drag identical Pokémon to evolve & earn Stones!
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 w-full max-w-2xl bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
        
        {/* Score */}
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Score</span>
          <span className="text-2xl font-bold text-white font-mono">{score.toLocaleString()}</span>
        </div>

        {/* Evo Stones Economy */}
        <div className="flex flex-col md:items-center">
           <span className="text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1">
             Evo Stones
             <span className="text-emerald-400 text-[10px] animate-pulse">(+{incomeRate}/s)</span>
           </span>
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/50 flex items-center justify-center text-[10px] border border-emerald-200">
               💎
             </div>
             <span className="text-2xl font-bold text-emerald-300 font-mono">{evoStones.toLocaleString()}</span>
           </div>
        </div>

        {/* Status Message */}
        <div className="flex flex-col items-end col-span-2 md:col-span-1 md:items-end">
           <span className="text-xs text-slate-400 uppercase tracking-widest">Status</span>
           <span className="text-sm font-medium text-yellow-300 truncate w-full text-right animate-pulse">
             {loading ? 'Evolving...' : lastEvent}
           </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 bg-slate-900/50 p-3 md:p-4 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md mb-6">
        {grid.map((item, index) => (
          <GridCell 
            key={index} 
            index={index} 
            item={item} 
            onDrop={handleDrop} 
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={handleBuyPokeball}
          disabled={loading || evoStones < POKEBALL_COST}
          className="
            group relative
            px-8 py-4 bg-gradient-to-b from-red-600 to-red-700 
            hover:from-red-500 hover:to-red-600
            active:from-red-700 active:to-red-800
            text-white font-bold rounded-full 
            shadow-lg shadow-red-900/50 transition-all 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
            flex items-center gap-3 border-b-4 border-red-900
            transform active:scale-95 active:border-b-0 active:translate-y-1
          "
        >
          {/* Pokeball Icon CSS */}
          <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-900 relative overflow-hidden flex items-center justify-center animate-bounce group-hover:animate-none">
            <div className="absolute top-0 w-full h-1/2 bg-red-600 border-b-2 border-slate-900"></div>
            <div className="w-2 h-2 rounded-full bg-white border-2 border-slate-900 z-10"></div>
          </div>
          
          <div className="flex flex-col items-start leading-tight">
            <span className="uppercase text-xs text-red-100 font-semibold tracking-wider">Buy Poké Ball</span>
            <span className="text-lg font-mono flex items-center gap-1">
               {POKEBALL_COST} <span className="text-sm">💎</span>
            </span>
          </div>
        </button>
      </div>
      
      {/* Footer Instructions */}
      <div className="mt-8 text-center text-slate-500 text-xs opacity-60 hover:opacity-100 transition-opacity">
        <p>Higher evolution stages generate more Evo Stones.</p>
        <p>Bulbasaur + Bulbasaur = Ivysaur</p>
      </div>

    </div>
  );
};

export default App;