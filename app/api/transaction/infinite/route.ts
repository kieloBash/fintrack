import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const cursor = Number(searchParams.get("cursor") ?? 0);
    const limit = Number(searchParams.get("limit") ?? 15);
    const search = searchParams.get("search") || undefined;

    const transactions = await prisma.transaction.findMany({
        where: search
            ? { label: { contains: search, mode: "insensitive" } }
            : undefined,
        skip: cursor,
        take: limit,
        orderBy: { transactionDate: "desc" },
    });

    const nextCursor = transactions.length === limit ? cursor + limit : null;

    return NextResponse.json({ items: transactions, nextCursor });
}