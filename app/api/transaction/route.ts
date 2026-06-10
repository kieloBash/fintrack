import prisma from "@/lib/prisma";
import { CreateTransactionSchema } from "@/services/transaction.service";
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
    const result = CreateTransactionSchema.safeParse(body)
    if (!result.success) {
        console.log(result.error)
        return NextResponse.json(
            { error: "Invalid payload!" },
            { status: 400 }
        );
    }
    const payload = result.data

    const newTransaction = await prisma.transaction.create({
        data: {
            userId: dbUser.id,
            categoryId: payload.categoryId,
            label: payload.label,
            amount: payload.amount,
            merchant: payload.merchant,
            description: payload.description,
            source: payload.source as any,
            transactionDate: new Date(payload.transactionDate),
        }
    })

    return NextResponse.json(
        newTransaction,
        { status: 201 }
    )
}