import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateRestaurant } from '../../../shared/api/hooks';
import { restaurantSchema, type RestaurantFormData } from '../../../shared/validation';

interface UseRestaurantFormOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const defaultValues: RestaurantFormData = {
  name: '',
  city: '',
  description: '',
  rating: 1,
  is_favorite: false,
};

export const useRestaurantFormRHF = (options: UseRestaurantFormOptions = {}) => {
  const { onSuccess, onError } = options;
  const createRestaurant = useCreateRestaurant();

  const form = useForm({
    resolver: zodResolver(restaurantSchema),
    defaultValues,
    mode: 'onChange' as const, // Validation en temps réel
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setValue,
    watch,
    trigger,
  } = form;

  // Watch fields for controlled components
  const watchedRating = watch('rating');
  const watchedName = watch('name');

  const handleStarClick = async (rating: number) => {
    setValue('rating', rating, { shouldValidate: true, shouldDirty: true });
    await trigger('rating'); // Trigger validation
  };

  const onSubmit = async (data: any) => {
    try {
      // Transform data for API if needed
      const apiData = {
        ...data,
        description: data.description || '', // Ensure empty string instead of undefined
      };
      
      await createRestaurant.mutateAsync(apiData);
      reset(); // Reset form to default values
      onSuccess?.();
    } catch (error) {
      console.error('Error adding restaurant:', error);
      onError?.(error as Error);
    }
  };

  return {
    // Form methods
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    
    // Form state
    isValid,
    isDirty,
    isLoading: createRestaurant.isPending,
    
    // Custom methods
    handleStarClick,
    watchedRating,
    watchedName,
    reset: () => reset(),
    setValue,
    
    // API state
    error: createRestaurant.error,
    isSuccess: createRestaurant.isSuccess,
  };
};