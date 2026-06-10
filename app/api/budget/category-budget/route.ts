import prisma from "@/lib/prisma";
import { CreateBudgetCategorySchema, UpdateBudgetCategorySchema } from "@/services/budget-category.service";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const user = await currentUser();

    const clerkId = user?.id;

    if (!clerkId) {
        return NextResponse.json(
            { error: "clerkId is required" },
            { status: 401 }
        );
    }

    const dbUser = await prisma.user.findFirst({
        where: { clerkId }
    })
    if (!dbUser) {
        return NextResponse.json(
            { error: "User is not in the database" },
            { status: 401 }
        );
    }

    const body = await req.json();
    const result = CreateBudgetCategorySchema.safeParse(body)
    if (!result.success) {
        console.log(result.error)
        return NextResponse.json(
            { error: "Invalid payload!" },
            { status: 400 }
        );
    }
    const payload = result.data

    const createdBudget = await prisma.budget.create({
        data: {
            userId: dbUser.id,
            categoryId: payload.categoryId,
            amount: payload.amount,
            period: "MONTHLY",
            startDate: new Date()
        }
    })

    return NextResponse.json(
        createdBudget,
        { status: 201 }
    );
}

export async function PATCH(req: Request) {
    const user = await currentUser();

    const clerkId = user?.id;

    if (!clerkId) {
        return NextResponse.json(
            { error: "clerkId is required" },
            { status: 401 }
        );
    }

    const dbUser = await prisma.user.findFirst({
        where: { clerkId }
    })
    if (!dbUser) {
        return NextResponse.json(
            { error: "User is not in the database" },
            { status: 401 }
        );
    }

    const body = await req.json();
    const result = UpdateBudgetCategorySchema.safeParse(body)
    if (!result.success) {
        console.log(result.error)
        return NextResponse.json(
            { error: "Invalid payload!" },
            { status: 400 }
        );
    }
    const payload = result.data

    await prisma.$transaction(
        payload.map(({ budgetId, amount }) =>
            prisma.budget.update({
                where: {
                    id: budgetId,
                },
                data: {
                    amount,
                },
            })
        )
    );

    return NextResponse.json(
        "Updated budgets successfully",
        { status: 200 }
    );

}