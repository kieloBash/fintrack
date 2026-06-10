import { Category } from "@/app/generated/prisma/client";
import { api } from "@/lib/axios";
import { CategoryIconName } from "@/lib/icon-mapper";

export type CategoryDTO = Category & {
    icon: CategoryIconName
}

export const CategoryService = {
    async getAll(): Promise<CategoryDTO[]> {
        const res = await api.get("/category",
        )
        return res.data;
    },
}