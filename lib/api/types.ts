export interface PaginatedResponse<T> {
    items: T[];
    nextCursor: number | null;
}

export interface PaginationParams {
    cursor?: number;
    limit?: number;
}