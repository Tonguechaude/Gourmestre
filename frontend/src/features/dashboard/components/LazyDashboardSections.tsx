import { lazy } from "react";

// Lazy load dashboard sections for better performance
export const LazyRestaurantSection = lazy(
  () => import("../../restaurants/components/RestaurantForm"),
);

export const LazyWishlistSection = lazy(
  () => import("../../wishlist/components/WishlistForm"),
);
