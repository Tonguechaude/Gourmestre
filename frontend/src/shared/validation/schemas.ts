import { z } from "zod";

// Restaurant form validation schema
export const restaurantSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom du restaurant est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),

  city: z
    .string()
    .min(1, "La ville est requise")
    .min(2, "La ville doit contenir au moins 2 caractères")
    .max(50, "La ville ne peut pas dépasser 50 caractères"),

  description: z
    .string()
    .max(500, "La description ne peut pas dépasser 500 caractères")
    .default(""),

  rating: z
    .number()
    .min(1, "La note doit être entre 1 et 5 étoiles")
    .max(5, "La note doit être entre 1 et 5 étoiles")
    .int("La note doit être un nombre entier"),

  is_favorite: z.boolean().default(false),
});

export type RestaurantFormData = z.infer<typeof restaurantSchema>;

// Wishlist form validation schema
export const wishlistSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom du restaurant est requis")
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),

  city: z
    .string()
    .min(1, "La ville est requise")
    .min(2, "La ville doit contenir au moins 2 caractères")
    .max(50, "La ville ne peut pas dépasser 50 caractères"),

  priority: z.enum(["low", "medium", "high"]).default("medium"),

  notes: z
    .string()
    .max(300, "Les notes ne peuvent pas dépasser 300 caractères")
    .default(""),
});

export type WishlistFormData = z.infer<typeof wishlistSchema>;

// Priority labels for display
export const priorityLabels = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
} as const;

export const priorityOptions = [
  { value: "low", label: priorityLabels.low },
  { value: "medium", label: priorityLabels.medium },
  { value: "high", label: priorityLabels.high },
] as const;
