import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateWishlistItem } from "../../../shared/api/hooks";
import {
  wishlistSchema,
  type WishlistFormData,
} from "../../../shared/validation";

interface UseWishlistFormOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const defaultValues: WishlistFormData = {
  name: "",
  city: "",
  notes: "",
  priority: "medium",
};

export const useWishlistFormRHF = (options: UseWishlistFormOptions = {}) => {
  const { onSuccess, onError } = options;
  const createWishlistItem = useCreateWishlistItem();

  const form = useForm({
    resolver: zodResolver(wishlistSchema),
    defaultValues,
    mode: "onChange" as const,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    setValue,
    watch,
  } = form;

  // Watch fields for controlled components
  const watchedName = watch("name");

  const onSubmit = async (data: any) => {
    try {
      const apiData = {
        ...data,
        notes: data.notes || "",
      };

      await createWishlistItem.mutateAsync(apiData);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error creating wishlist item:", error);
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
    isLoading: createWishlistItem.isPending,

    // Custom methods
    watchedName,
    reset: () => reset(),
    setValue,

    // API state
    error: createWishlistItem.error,
    isSuccess: createWishlistItem.isSuccess,
  };
};
