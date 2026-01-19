export interface PokemonData {
  id: number;
  name: string;
  image: string;
}

export type GridItem = PokemonData | null;

export interface EvolutionRules {
  [key: number]: number;
}