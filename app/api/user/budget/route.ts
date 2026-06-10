import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
    const user = await currentUser();

    const clerkId = user?.id;

    if (!clerkId) {
        return NextResponse.json(
            { error: "clerkId is required" },
            { status: 400 }
        );
    }

    const dbUser = await prisma.user.findFirst({
        where: { clerkId },
        select: { id: true }
    })
    if (!dbUser) {
        return NextResponse.json(
            { error: "User is not in the database" },
            { status: 400 }
        );
    }

    const userBudgets = await prisma.budget.findMany({
        where: {
            user: {
                clerkId,
            }
        }
    })

    return NextResponse.json(userBudgets, {
        status: 200,
    });
}