import { lazy } from 'react';

// Lazy load main pages
export const LazyDashboard = lazy(() => import('./Dashboard'));
export const LazyLogin = lazy(() => import('./Login'));

// Lazy load feature components
export const LazyRestaurantForm = lazy(() => 
  import('../features/restaurants/components/RestaurantForm')
);

export const LazyWishlistForm = lazy(() => 
  import('../features/wishlist/components/WishlistForm')
);

export const LazyDashboardLayout = lazy(() => 
  import('../features/dashboard/components/DashboardLayout')
);