import { EvolutionRules } from './types';

// Nivel 1 se fusiona a Nivel 2, Nivel 2 a Nivel 3.
export const EVOLUTION_RULES: EvolutionRules = {
  // Línea Bulbasaur
  1: 2,  // Bulbasaur (1) + Bulbasaur (1) = Ivysaur (2)
  2: 3,  // Ivysaur (2) + Ivysaur (2) = Venusaur (3)
  // Línea Charmander
  4: 5,  // Charmander (4) + Charmander (4) = Charmeleon (5)
  5: 6,  // Charmeleon (5) + Charmeleon (5) = Charizard (6)
  // Línea Squirtle
  7: 8,  // Squirtle (7) + Squirtle (7) = Wartortle (8)
  8: 9   // Wartortle (8) + Wartortle (8) = Blastoise (9)
};

// Solo estos IDs pueden aparecer automáticamente (Nivel 1)
export const SPAWNABLE_IDS = [1, 4, 7];

export const GRID_SIZE = 4;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
export const SPAWN_INTERVAL_MS = 3000;