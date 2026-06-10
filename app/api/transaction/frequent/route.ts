import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
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

    const frequentTransactions = await prisma.transaction.groupBy({
        by: ["label", "amount", "categoryId"],
        where: {
            userId: dbUser.id,
        },
        _count: {
            label: true,
        },
        orderBy: {
            _count: {
                label: "desc",
            },
        },
        take: 3,
    });

    return NextResponse.json(
        frequentTransactions.map((f) => ({
            ...f,
            count: f._count.label
        })),
        { status: 200 }
    )
}