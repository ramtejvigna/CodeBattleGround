// app/api/profile/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
    try {
        // Verify authentication
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();

        const { name, email, phone, bio, image, preferredLanguage, userId } = body;

        // Validate required fields
        if (!name || !email || !userId) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (session.user.id !== userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized to update this profile' },
                { status: 403 }
            );
        }

        // Construct the data object for the update
        const updateData: any = {
            name,
            email,
            image,
            userProfile: {
                upsert: {
                    create: {
                        bio: bio || null,
                        phone: phone || null,
                        preferredLanguage: preferredLanguage || null,
                        rank: 0,
                        solved: 0,
                        level: 1,
                        points: 0,
                        streakDays: 0,
                        badges: []
                    },
                    update: {
                        bio: bio || null,
                        phone: phone || null,
                        preferredLanguage: preferredLanguage || null
                    }
                }
            }
        };

        // Update user data
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            include: {
                userProfile: true
            }
        });

        return NextResponse.json({
            success: true,
            user: updatedUser
        });
    } catch (error: any) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update profile' },
            { status: 500 }
        );
    }
}