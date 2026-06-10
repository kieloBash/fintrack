import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { setHours, setMilliseconds, setMinutes, setSeconds } from "date-fns";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const user = await currentUser();

        const clerkId = user?.id;

        if (!clerkId) {
            return NextResponse.json(
                { error: "clerkId is required" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId,
            },
        });

        if (existingUser) {
            return NextResponse.json(existingUser);
        }


        const newUser = await prisma.user.create({
            data: {
                clerkId,
            },
        });

        const now = new Date();

        const eightAM = setMilliseconds(
            setSeconds(
                setMinutes(
                    setHours(now, 8),
                    0
                ),
                0
            ),
            0
        );

        await prisma.notificationSettings.create({
            data: {
                user: {
                    connect: newUser
                },
                dailySummary: true,
                budgetWarning: true,
                largeTransaction: true,
                unusualSpend: true,
                weeklyReport: true,
                savingsReminder: true,
                summaryTime: eightAM.toISOString(),
            }
        })

        await prisma.connectedEmail.create({
            data: {
                emailAddress: user.emailAddresses[0].emailAddress,
                provider: "GMAIL",
                status: "ACTIVE",
                lastSyncedAt: new Date(),
                user: {
                    connect: newUser
                }
            }
        })

        return NextResponse.json(newUser, {
            status: 201,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}