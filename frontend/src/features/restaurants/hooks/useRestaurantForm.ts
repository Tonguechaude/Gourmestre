import { useState, useCallback } from 'react';
import { useCreateRestaurant } from '../../../shared/api/hooks';

export interface RestaurantFormData {
  name: string;
  city: string;
  description: string;
  rating: number;
  is_favorite: boolean;
}

export const initialFormData: RestaurantFormData = {
  name: '',
  city: '',
  description: '',
  rating: 0,
  is_favorite: false,
};

interface UseRestaurantFormOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useRestaurantForm = (options: UseRestaurantFormOptions = {}) => {
  const { onSuccess, onError } = options;
  const [formData, setFormData] = useState<RestaurantFormData>(initialFormData);
  const createRestaurant = useCreateRestaurant();

  const updateField = useCallback((field: keyof RestaurantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    updateField(name as keyof RestaurantFormData, fieldValue);
  }, [updateField]);

  const handleStarClick = useCallback((rating: number) => {
    updateField('rating', rating);
  }, [updateField]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    try {
      await createRestaurant.mutateAsync(formData);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error('Error adding restaurant:', error);
      onError?.(error as Error);
    }
  }, [createRestaurant, formData, resetForm, onSuccess, onError]);

  return {
    // State
    formData,
    setFormData,
    
    // Actions
    updateField,
    handleInputChange,
    handleStarClick,
    handleSubmit,
    resetForm,
    
    // Status
    isLoading: createRestaurant.isPending,
    error: createRestaurant.error,
    isSuccess: createRestaurant.isSuccess,
  };
};