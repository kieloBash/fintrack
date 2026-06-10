import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 mins
                gcTime: 1000 * 60 * 30,   // 30 mins
                retry: 1,
                refetchOnWindowFocus: false,
            },
            mutations: {
                retry: 1,
            },
        },
    });
}