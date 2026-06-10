import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(req: Request) {
    const { userId } = await auth();

    if (!userId) {
        return Response.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const body = await req.json();

    const profile = await prisma.user.findUnique({
        where: {
            clerkId: userId,
        },
        select: {
            id: true,
        },
    });

    if (!profile) {
        return Response.json(
            { message: "User not found" },
            { status: 404 }
        );
    }

    if (body?.summaryTime) {
        const [hours, minutes] = body.summaryTime.split(":").map(Number);

        const now = new Date();

        const summaryDate = new Date(now);
        summaryDate.setHours(hours, minutes, 0, 0);

        const settings = await prisma.notificationSettings.update({
            where: {
                userId: profile.id,
            },
            data: {
                summaryTime: summaryDate.toISOString(),
            },
        });

        return Response.json(settings);
    }

    const settings =
        await prisma.notificationSettings.update({
            where: {
                userId: profile.id,
            },
            data: body,
        });

    return Response.json(settings);
}