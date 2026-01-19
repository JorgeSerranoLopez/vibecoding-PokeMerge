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
export const SPAWN_INTERVAL_MS = 5000; // Increased to make buying more relevant
export const POKEBALL_COST = 50;

// Income generation per pokemon ID (Stones per second)
export const INCOME_MAP: Record<number, number> = {
  // Tier 1 (1/sec)
  1: 1, 4: 1, 7: 1,
  // Tier 2 (4/sec)
  2: 4, 5: 4, 8: 4,
  // Tier 3 (12/sec)
  3: 12, 6: 12, 9: 12
};