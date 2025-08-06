import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { restaurantApi, type RestaurantInput } from '../../../api/client';

// Query keys pour le cache
export const restaurantKeys = {
  all: ['restaurants'] as const,
  lists: () => [...restaurantKeys.all, 'list'] as const,
  list: (filters: string) => [...restaurantKeys.lists(), filters] as const,
  details: () => [...restaurantKeys.all, 'detail'] as const,
  detail: (id: number) => [...restaurantKeys.details(), id] as const,
  stats: () => [...restaurantKeys.all, 'stats'] as const,
  favorites: () => [...restaurantKeys.all, 'favorites'] as const,
  recent: (limit: number) => [...restaurantKeys.all, 'recent', limit] as const,
};

// Hook pour récupérer tous les restaurants
export const useRestaurants = () => {
  return useQuery({
    queryKey: restaurantKeys.lists(),
    queryFn: restaurantApi.getRestaurants,
  });
};

// Hook pour récupérer les statistiques
export const useRestaurantStats = () => {
  return useQuery({
    queryKey: restaurantKeys.stats(),
    queryFn: restaurantApi.getStats,
  });
};

// Hook pour récupérer les favoris
export const useFavoriteRestaurants = () => {
  return useQuery({
    queryKey: restaurantKeys.favorites(),
    queryFn: restaurantApi.getFavorites,
  });
};

// Hook pour récupérer les récents
export const useRecentRestaurants = (limit = 20) => {
  return useQuery({
    queryKey: restaurantKeys.recent(limit),
    queryFn: () => restaurantApi.getRecent(limit),
  });
};

// Hook pour créer un restaurant
export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RestaurantInput) => restaurantApi.createRestaurant(data),
    onSuccess: () => {
      // Invalider les caches liés aux restaurants
      queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
    },
    onError: (error) => {
      console.error('Erreur lors de la création du restaurant:', error);
    },
  });
};

// Hook pour supprimer un restaurant
export const useDeleteRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => restaurantApi.deleteRestaurant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression du restaurant:', error);
    },
  });
};

// Hook pour mettre à jour un restaurant
export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<RestaurantInput> }) => 
      restaurantApi.updateRestaurant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour du restaurant:', error);
    },
  });
};