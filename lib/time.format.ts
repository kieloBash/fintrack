import { formatDistanceToNow } from "date-fns";

export function getTimeAgo(date: string | Date) {
    return formatDistanceToNow(new Date(date), {
        addSuffix: true,
    });
}