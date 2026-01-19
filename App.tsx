import React, { useState, useEffect, useCallback, useRef } from 'react';
import { EVOLUTION_RULES, SPAWNABLE_IDS, TOTAL_CELLS, SPAWN_INTERVAL_MS } from './constants';
import { GridItem } from './types';
import { fetchPokemonData } from './services/pokemonService';
import { GridCell } from './components/GridCell';

const App: React.FC = () => {
  const [grid, setGrid] = useState<GridItem[]>(Array(TOTAL_CELLS).fill(null));
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<string>("Welcome! Drag matching Pokémon to evolve.");
  
  // Audio refs for simple effects (conceptual, no actual files loaded here to keep it single-block logic)
  // In a real app, we'd preload Audio objects here.

  const spawnPokemon = useCallback(async () => {
    setGrid(currentGrid => {
      // Find empty indices
      const emptyIndices = currentGrid
        .map((item, index) => (item === null ? index : -1))
        .filter(index => index !== -1);

      if (emptyIndices.length === 0) {
        // Game Over condition could be checked here
        return currentGrid;
      }

      // Pick random spot
      const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      // Pick random starter
      const randomId = SPAWNABLE_IDS[Math.floor(Math.random() * SPAWNABLE_IDS.length)];

      // We need to fetch data, but we can't do async inside the state updater easily without side effects.
      // However, for this specific pattern, we'll trigger the fetch outside or manage it differently.
      // To ensure atomicity, we will return the grid as is, and use a side effect to update it.
      return currentGrid;
    });

    // Actual spawn logic separated to handle async nature
    const emptyIndices = grid
      .map((item, index) => (item === null ? index : -1))
      .filter(index => index !== -1);
    
    if (emptyIndices.length === 0) return;

    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    const randomId = SPAWNABLE_IDS[Math.floor(Math.random() * SPAWNABLE_IDS.length)];

    try {
      const data = await fetchPokemonData(randomId);
      if (data) {
        setGrid(prev => {
          // Double check if it's still empty (race condition check)
          if (prev[randomIndex] !== null) return prev; 
          const newGrid = [...prev];
          newGrid[randomIndex] = data;
          return newGrid;
        });
      }
    } catch (e) {
      console.error("Failed to spawn", e);
    }
  }, [grid]);

  // Game Loop: Spawn every X seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      spawnPokemon();
    }, SPAWN_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [spawnPokemon]);

  // Initial spawn
  useEffect(() => {
    // Spawn 2 starters at the beginning
    spawnPokemon();
    setTimeout(() => spawnPokemon(), 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualSpawn = () => {
    spawnPokemon();
    setLastEvent("Manual Spawn!");
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
            setScore(prev => prev + (nextEvolutionId * 10)); // Simple scoring logic
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 font-sans">
      
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 mb-2 drop-shadow-md">
          PokéMerge
        </h1>
        <p className="text-slate-400 text-sm md:text-base">
          Drag identical Pokémon to evolve them!
        </p>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 mb-6 w-full max-w-md justify-between bg-slate-800/80 p-4 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Score</span>
          <span className="text-2xl font-bold text-white font-mono">{score.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-xs text-slate-400 uppercase tracking-widest">Status</span>
           <span className="text-sm font-medium text-yellow-300 truncate max-w-[150px] animate-pulse">
             {loading ? 'Evolving...' : lastEvent}
           </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-2 md:gap-3 bg-slate-900/50 p-3 md:p-4 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md">
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
      <div className="mt-8 flex gap-4">
        <button
          onClick={handleManualSpawn}
          disabled={loading}
          className="
            px-6 py-3 bg-indigo-600 hover:bg-indigo-500 
            active:bg-indigo-700 text-white font-bold rounded-full 
            shadow-lg shadow-indigo-500/30 transition-all 
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center gap-2
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Spawn Pokémon
        </button>
      </div>
      
      {/* Footer Instructions */}
      <div className="mt-8 text-center text-slate-500 text-xs">
        <p>Bulbasaur + Bulbasaur = Ivysaur</p>
        <p>Charmander + Charmander = Charmeleon</p>
        <p>Squirtle + Squirtle = Wartortle</p>
      </div>

    </div>
  );
};

export default App;