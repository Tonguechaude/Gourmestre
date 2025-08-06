import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../../api/client';

// Types pour l'authentification
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

// Query keys pour le cache
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
} as const;

// Hook pour récupérer l'utilisateur actuel
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authApi.me,
    retry: false, // Ne pas retry sur les erreurs 401
    staleTime: Infinity, // Les données utilisateur ne deviennent jamais stale
  });
};

// Hook pour la connexion
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (user) => {
      // Mettre à jour le cache utilisateur
      queryClient.setQueryData(authKeys.user(), user);
    },
    onError: (error) => {
      console.error('Erreur lors de la connexion:', error);
      // Nettoyer le cache en cas d'erreur
      queryClient.removeQueries({ queryKey: authKeys.user() });
    },
  });
};

// Hook pour l'inscription
export const useRegister = () => {
  return useMutation({
    mutationFn: (userData: RegisterRequest) => authApi.register(userData),
    onSuccess: () => {
      // Pas de mise à jour automatique du cache - l'utilisateur doit se connecter
      console.log('Inscription réussie');
    },
    onError: (error) => {
      console.error('Erreur lors de l\'inscription:', error);
    },
  });
};

// Hook pour la déconnexion
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Nettoyer tout le cache
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur, nettoyer le cache local
      queryClient.clear();
    },
  });
};

// Hook pour vérifier si l'utilisateur est connecté
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!user && !isLoading,
    isLoading,
    user,
  };
};