"use client";

import { PaginatedResponse } from "@/lib/api/types";
import { useInfiniteQuery } from "@tanstack/react-query";

interface UsePaginatedQueryOptions {
    queryKey: readonly unknown[];
    queryFn: (params: any) => Promise<PaginatedResponse<any>>;
    params?: Record<string, any>;
    limit?: number;
    initialPageParam?: number;
    enabled?: boolean;
}

export function usePaginatedQuery({
    queryKey,
    queryFn,
    params,
    limit = 10,
    initialPageParam = 0,
    enabled,
}: UsePaginatedQueryOptions) {
    return useInfiniteQuery({
        queryKey: [...queryKey, params, limit],
        queryFn: ({ pageParam }: { pageParam: number }) =>
            queryFn({
                ...params,
                cursor: pageParam,
                limit,
            }),
        initialPageParam,
        getNextPageParam: (lastPage: PaginatedResponse<any>) =>
            lastPage.nextCursor,
        enabled,
    });
}