import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UpdateProfileRequest {
    name?: string;
    email?: string;
    phone?: string;
    bio?: string;
    image?: string;
    preferredLanguage?: string;
    userId: string;
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json() as UpdateProfileRequest;
        const { name, email, phone, bio, image, preferredLanguage, userId } = body;

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

        // Prepare the update data
        const updateData: any = {
            name,
            email,
            ...(image && { image }),
            updatedAt: new Date()
        };

        // Only include profile fields if at least one is provided
        const hasProfileUpdates = bio !== undefined || phone !== undefined || preferredLanguage !== undefined;
        
        if (hasProfileUpdates) {
            updateData.userProfile = {
                upsert: {
                    create: {
                        bio: bio || '',
                        phone: phone || '',
                        preferredLanguage: preferredLanguage || 'en',
                        rank: 0,
                        solved: 0,
                        level: 1,
                        points: 0,
                        streakDays: 0,
                        badges: []
                    },
                    update: {
                        ...(bio !== undefined && { bio }),
                        ...(phone !== undefined && { phone }),
                        ...(preferredLanguage !== undefined && { preferredLanguage }),
                        updatedAt: new Date()
                    }
                }
            };
        }

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
    } catch (err) {
        console.error('Error updating profile:', err instanceof Error ? err.message : err);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to update profile',
                error: err instanceof Error ? err.message : 'Unknown error'
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}