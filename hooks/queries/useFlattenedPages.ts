export function flattenPages<TItem = any>(data: any): TItem[] {
    return data?.pages?.flatMap((page: any) => page.items) ?? [];
}