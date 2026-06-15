export const queryKeys = {
    user: {
        profile: ["user-profile", "user"] as const,
        budget: ["user-budgets", "user"] as const,
    },
    category: {
        all: ["category"] as const
    },
    budget: {
        summary: ["budget", "summary"] as const
    },
    transaction: {
        all: ["transaction"] as const,
        infinite: ["transaction", "infinite"] as const,
        recent: ["recent"] as const,
        frequent: ["frequent"] as const,
    },
}