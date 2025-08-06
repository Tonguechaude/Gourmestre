import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useRestaurants } from '../useRestaurants';
import { restaurantApi } from '../../../../api/client';

// Mock du client API
vi.mock('../../../../api/client', () => ({
  restaurantApi: {
    getRestaurants: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => 
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useRestaurants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch restaurants successfully', async () => {
    const mockData = [
      { id: 1, name: 'Test Restaurant', city: 'Paris', rating: 5, is_favorite: true }
    ];
    
    vi.mocked(restaurantApi.getRestaurants).mockResolvedValue(mockData);

    const { result } = renderHook(() => useRestaurants(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
    expect(restaurantApi.getRestaurants).toHaveBeenCalledTimes(1);
  });

  it('should handle error state', async () => {
    const mockError = new Error('API Error');
    vi.mocked(restaurantApi.getRestaurants).mockRejectedValue(mockError);

    const { result } = renderHook(() => useRestaurants(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(mockError);
  });
});