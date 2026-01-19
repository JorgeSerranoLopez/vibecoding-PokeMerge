import { EvolutionRules } from './types';

// Nivel 1 se fusiona a Nivel 2, Nivel 2 a Nivel 3.
// Final Gen 1 se fusiona a Inicial Gen 2.
export const EVOLUTION_RULES: EvolutionRules = {
  // --- GENERATION 1 ---
  // Bulbasaur Line
  1: 2,   2: 3,
  // Charmander Line
  4: 5,   5: 6,
  // Squirtle Line
  7: 8,   8: 9,

  // --- GEN 1 -> GEN 2 BRIDGES ---
  3: 152, // Venusaur -> Chikorita
  6: 155, // Charizard -> Cyndaquil
  9: 158, // Blastoise -> Totodile

  // --- GENERATION 2 ---
  // Chikorita Line
  152: 153, 153: 154,
  // Cyndaquil Line
  155: 156, 156: 157,
  // Totodile Line
  158: 159, 159: 160
};

// Solo estos IDs pueden aparecer en las Poké Balls (Nivel 1 Gen 1)
export const SPAWNABLE_IDS = [1, 4, 7];

export const GRID_SIZE = 4;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
// Removed SPAWN_INTERVAL_MS as requested (no auto spawn)
export const POKEBALL_COST = 50;

// Income generation per pokemon ID (Stones per second)
export const INCOME_MAP: Record<number, number> = {
  // Gen 1
  1: 1, 4: 1, 7: 1,      // Base
  2: 4, 5: 4, 8: 4,      // Stage 1
  3: 12, 6: 12, 9: 12,   // Stage 2

  // Gen 2 (High Income)
  152: 30, 155: 30, 158: 30,    // Base Gen 2
  153: 75, 156: 75, 159: 75,    // Stage 1 Gen 2
  154: 200, 157: 200, 160: 200  // Stage 2 Gen 2
};