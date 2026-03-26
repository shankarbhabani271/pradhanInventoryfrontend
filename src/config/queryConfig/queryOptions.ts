// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";
import type { DefaultOptions } from "@tanstack/react-query";

const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 60 * 1000, // 1 min
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: 0,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});