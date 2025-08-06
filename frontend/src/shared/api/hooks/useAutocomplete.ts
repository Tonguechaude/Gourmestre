import { useQuery } from '@tanstack/react-query';
import { autocompleteApi, type AutocompleteResponse } from '../../../api/client';

// Query keys pour le cache
export const autocompleteKeys = {
  all: ['autocomplete'] as const,
  restaurants: (searchTerm: string) => [...autocompleteKeys.all, 'restaurants', searchTerm] as const,
  wishlist: (searchTerm: string) => [...autocompleteKeys.all, 'wishlist', searchTerm] as const,
};

// Hook pour l'autocomplétion des restaurants
export const useRestaurantAutocomplete = (searchTerm: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: autocompleteKeys.restaurants(searchTerm),
    queryFn: () => autocompleteApi.searchRestaurants(searchTerm),
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 1000 * 60 * 10, // 10 minutes - les suggestions sont assez stables
    select: (data: AutocompleteResponse) => data.suggestions,
  });
};

// Hook pour l'autocomplétion de la wishlist
export const useWishlistAutocomplete = (searchTerm: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: autocompleteKeys.wishlist(searchTerm),
    queryFn: () => autocompleteApi.searchWishlist(searchTerm),
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 1000 * 60 * 10, // 10 minutes
    select: (data: AutocompleteResponse) => data.suggestions,
  });
};