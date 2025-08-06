import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistApi, type WishlistInput } from '../../../api/client';

// Query keys pour le cache
export const wishlistKeys = {
  all: ['wishlist'] as const,
  items: () => [...wishlistKeys.all, 'items'] as const,
  count: () => [...wishlistKeys.all, 'count'] as const,
};

// Hook pour récupérer la wishlist
export const useWishlist = () => {
  return useQuery({
    queryKey: wishlistKeys.items(),
    queryFn: wishlistApi.getWishlist,
  });
};

// Hook pour récupérer le nombre d'éléments en wishlist
export const useWishlistCount = () => {
  return useQuery({
    queryKey: wishlistKeys.count(),
    queryFn: wishlistApi.getWishlistCount,
    select: (data) => data.count,
  });
};

// Hook pour créer un élément de wishlist
export const useCreateWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WishlistInput) => wishlistApi.createWishlistItem(data),
    onSuccess: () => {
      // Invalider les caches de la wishlist
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
    onError: (error) => {
      console.error('Erreur lors de la création de l\'élément wishlist:', error);
    },
  });
};

// Hook pour supprimer un élément de wishlist
export const useDeleteWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => wishlistApi.deleteWishlistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
    onError: (error) => {
      console.error('Erreur lors de la suppression de l\'élément wishlist:', error);
    },
  });
};

// Hook pour promouvoir un élément de wishlist en restaurant
export const usePromoteWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => wishlistApi.promoteWishlistItem(id),
    onSuccess: () => {
      // Invalider à la fois la wishlist ET les restaurants
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: (error) => {
      console.error('Erreur lors de la promotion de l\'élément wishlist:', error);
    },
  });
};

// Hook pour mettre à jour un élément de wishlist
export const useUpdateWishlistItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WishlistInput> }) => 
      wishlistApi.updateWishlistItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
    },
    onError: (error) => {
      console.error('Erreur lors de la mise à jour de l\'élément wishlist:', error);
    },
  });
};