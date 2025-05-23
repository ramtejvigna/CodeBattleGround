import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UpdateProfileRequest {
    userId: string;
    name?: string;
    email?: string;
    image?: string | null;
    profile?: {
        phone?: string;
        bio?: string;
        preferredLanguage?: string;
    }
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
        const { name, email, image, profile, userId } = body;

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
        const hasProfileUpdates = profile?.bio !== undefined || 
                               profile?.phone !== undefined || 
                               profile?.preferredLanguage !== undefined;
        
        if (hasProfileUpdates) {
            updateData.userProfile = {
                upsert: {
                    create: {
                        bio: profile?.bio || '',
                        phone: profile?.phone || '',
                        preferredLanguage: profile?.preferredLanguage || 'Java',
                        rank: null,
                        solved: 0,
                        level: 1,
                        points: 0,
                        streakDays: 0,
                        // Removed the badges field as it was causing the error
                        // The default value will be handled by Prisma schema
                    },
                    update: {
                        ...(profile?.bio !== undefined && { bio: profile?.bio }),
                        ...(profile?.phone !== undefined && { phone: profile?.phone }),
                        ...(profile?.preferredLanguage !== undefined && { 
                            preferredLanguage: profile?.preferredLanguage 
                        }),
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