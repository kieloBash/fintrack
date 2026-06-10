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

    const userProfile = await prisma.user.findFirst({
        where: { clerkId },
        include: {
            budgets: true,
            notificationSettings: true,
            connectedEmails: true
        }
    })

    return NextResponse.json(userProfile, {
        status: 200,
    });
}