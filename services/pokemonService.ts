import { PokemonData } from '../types';

const cache = new Map<number, PokemonData>();

export const fetchPokemonData = async (id: number): Promise<PokemonData | null> => {
  if (cache.has(id)) {
    return cache.get(id) || null;
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) {
      throw new Error(`Pokemon not found: ${id}`);
    }
    const data = await response.json();
    
    // Use the animated Generation V (Black/White) sprite if available, fallback to default
    const animatedImage = data.sprites.versions['generation-v']['black-white'].animated.front_default;
    const staticImage = data.sprites.front_default;

    const pokemon: PokemonData = {
      id: data.id,
      name: data.name,
      image: animatedImage || staticImage || '', 
    };

    cache.set(id, pokemon);
    return pokemon;
  } catch (error) {
    console.error(`Error fetching pokemon ${id}:`, error);
    return null;
  }
};