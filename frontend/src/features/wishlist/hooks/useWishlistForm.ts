import { useState, useCallback } from 'react';
import { useCreateWishlistItem } from '../../../shared/api/hooks';

export interface WishlistFormData {
  name: string;
  city: string;
  notes: string;
  priority: 'low' | 'medium' | 'high';
}

export const initialWishlistFormData: WishlistFormData = {
  name: '',
  city: '',
  notes: '',
  priority: 'medium',
};

interface UseWishlistFormOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useWishlistForm = (options: UseWishlistFormOptions = {}) => {
  const { onSuccess, onError } = options;
  const [formData, setFormData] = useState<WishlistFormData>(initialWishlistFormData);
  const createWishlistItem = useCreateWishlistItem();

  const updateField = useCallback((field: keyof WishlistFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateField(name as keyof WishlistFormData, value);
  }, [updateField]);

  const resetForm = useCallback(() => {
    setFormData(initialWishlistFormData);
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    try {
      await createWishlistItem.mutateAsync(formData);
      resetForm();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating wishlist item:', error);
      onError?.(error as Error);
    }
  }, [createWishlistItem, formData, resetForm, onSuccess, onError]);

  return {
    // State
    formData,
    setFormData,
    
    // Actions
    updateField,
    handleInputChange,
    handleSubmit,
    resetForm,
    
    // Status
    isLoading: createWishlistItem.isPending,
    error: createWishlistItem.error,
    isSuccess: createWishlistItem.isSuccess,
  };
};