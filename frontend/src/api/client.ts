import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // This ensures cookies are sent with requests
});

// Add response interceptor to handle 401 errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login or register page
      const currentPath = window.location.pathname;
      if (
        currentPath !== "/login" &&
        currentPath !== "/register" &&
        currentPath !== "/"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  failed_login_attempts: number;
  last_login: string | null;
  account_locked_until: string | null;
}

export interface Restaurant {
  id: number;
  name: string;
  city: string;
  description?: string;
  rating: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface RestaurantInput {
  name: string;
  city: string;
  description?: string;
  rating: number;
  is_favorite: boolean;
}

export interface WishlistItem {
  id: number;
  name: string;
  city: string;
  notes?: string;
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

export interface WishlistInput {
  name: string;
  city: string;
  notes?: string;
  priority: "low" | "medium" | "high";
}

export interface Stats {
  total_restaurants: number;
  total_favorites: number;
  average_rating: string;
}

// Auth API
export const authApi = {
  register: (credentials: {
    username: string;
    password: string;
  }): Promise<User> =>
    apiClient.post("/auth/register", credentials).then((res) => res.data),

  login: (credentials: { username: string; password: string }): Promise<User> =>
    apiClient.post("/auth/login", credentials).then((res) => res.data),

  logout: (): Promise<void> =>
    apiClient.post("/auth/logout").then((res) => res.data),

  me: (): Promise<User> => apiClient.get("/auth/me").then((res) => res.data),

  check: (): Promise<{ authenticated: boolean }> =>
    apiClient.get("/auth/check").then((res) => res.data),
};

export const restaurantApi = {
  getRestaurants: (): Promise<Restaurant[]> =>
    apiClient.get("/restaurants").then((res) => res.data),

  createRestaurant: (restaurant: RestaurantInput): Promise<Restaurant> =>
    apiClient.post("/restaurants", restaurant).then((res) => res.data),

  getStats: (): Promise<Stats> =>
    apiClient.get("/restaurants/stats").then((res) => res.data),

  searchRestaurants: (query: any): Promise<Restaurant[]> =>
    apiClient.post("/restaurants/search", query).then((res) => res.data),

  getRestaurant: (id: number): Promise<Restaurant> =>
    apiClient.get(`/restaurants/${id}`).then((res) => res.data),

  updateRestaurant: (
    id: number,
    restaurant: Partial<RestaurantInput>,
  ): Promise<Restaurant> =>
    apiClient.put(`/restaurants/${id}`, restaurant).then((res) => res.data),

  deleteRestaurant: (id: number): Promise<void> =>
    apiClient.delete(`/restaurants/${id}`).then((res) => res.data),

  // Helper methods for filtering
  getFavorites: (): Promise<Restaurant[]> =>
    apiClient
      .get("/restaurants")
      .then((res) => res.data.filter((r: Restaurant) => r.is_favorite)),

  getRecent: (limit: number = 20): Promise<Restaurant[]> =>
    apiClient.get("/restaurants").then((res) => res.data.slice(0, limit)),
};

// Wishlist API
export const wishlistApi = {
  getWishlist: (): Promise<WishlistItem[]> =>
    apiClient.get("/wishlist").then((res) => res.data),

  createWishlistItem: (item: WishlistInput): Promise<WishlistItem> =>
    apiClient.post("/wishlist", item).then((res) => res.data),

  getWishlistCount: (): Promise<{ count: number }> =>
    apiClient.get("/wishlist/count").then((res) => res.data),

  getWishlistByPriority: (
    priority: "low" | "medium" | "high",
  ): Promise<WishlistItem[]> =>
    apiClient.get(`/wishlist/priority/${priority}`).then((res) => res.data),

  getWishlistItem: (id: number): Promise<WishlistItem> =>
    apiClient.get(`/wishlist/${id}`).then((res) => res.data),

  updateWishlistItem: (
    id: number,
    item: Partial<WishlistInput>,
  ): Promise<WishlistItem> =>
    apiClient.put(`/wishlist/${id}`, item).then((res) => res.data),

  deleteWishlistItem: (id: number): Promise<void> =>
    apiClient.delete(`/wishlist/${id}`).then((res) => res.data),

  promoteWishlistItem: (id: number): Promise<Restaurant> =>
    apiClient.post(`/wishlist/${id}/promote`).then((res) => res.data),
};

// Autocomplete types
export interface AutocompleteSuggestion {
  name: string;
  city: string;
}

export interface AutocompleteResponse {
  suggestions: AutocompleteSuggestion[];
}

// Autocomplete API
export const autocompleteApi = {
  searchRestaurants: (searchTerm: string): Promise<AutocompleteResponse> =>
    apiClient
      .post("/autocomplete/restaurants", { search_term: searchTerm })
      .then((res) => res.data),

  searchWishlist: (searchTerm: string): Promise<AutocompleteResponse> =>
    apiClient
      .post("/autocomplete/wishlist", { search_term: searchTerm })
      .then((res) => res.data),
};
