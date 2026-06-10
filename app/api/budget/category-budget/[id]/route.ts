import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;
    if (!id) {
        return NextResponse.json(
            { error: "No id found!" },
            { status: 400 }
        );
    }

    await prisma.budget.delete({
        where: {
            id,
        },
    });

    return NextResponse.json(
        "Deleted budget successfully",
        { status: 200 }
    );

}