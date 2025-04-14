import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Extract query parameters
        const searchParams = request.nextUrl.searchParams;
        const page = Number(searchParams.get('page')) || 1;
        const limit = Number(searchParams.get('limit')) || 10;
        const search = searchParams.get('search') || '';
        const difficulty = searchParams.get('difficulty') || undefined;
        const category = searchParams.get('category') || undefined;
        const sortBy = searchParams.get('sortBy') || 'newest';

        // Build filter and sort options
        const whereCondition: any = {
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            }),
            ...(difficulty && difficulty !== 'all' && { difficulty }),
            ...(category && category !== 'all' && { category: { name: category } })
        };

        // Determine sort order
        const orderBy = (() => {
            switch (sortBy) {
                case 'newest': return { createdAt: 'desc' };
                case 'oldest': return { createdAt: 'asc' };
                case 'most-liked': return { likes: { _count: 'desc' } };
                case 'most-submissions': return { submissions: { _count: 'desc' } };
                case 'highest-points': return { points: 'desc' };
                default: return { createdAt: 'desc' };
            }
        })();

        // Fetch challenges with related data and categories in parallel
        const [challenges, categories, total] = await Promise.all([
            prisma.challenge.findMany({
                where: whereCondition,
                include: {
                    category: true,
                    languages: true,
                    submissions: true,
                    _count: {
                        select: {
                            likes: true,
                            submissions: true
                        }
                    }
                },
                orderBy: {
                    [sortBy === 'newest' || sortBy === 'oldest' ? 'createdAt' :
                        sortBy === 'most-liked' ? 'likes' :
                            sortBy === 'most-submissions' ? 'submissions' :
                                sortBy === 'highest-points' ? 'points' : 'createdAt']:
                        sortBy === 'oldest' ? 'asc' : 'desc'
                },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.challengeCategory.findMany({
                select: {
                    id: true,
                    name: true,
                    description: true
                }
            }),
            prisma.challenge.count({ where: whereCondition })
        ]);

        return NextResponse.json({
            challenges: challenges.map(challenge => ({
                ...challenge,
                likes: challenge._count.likes,
                submissions: challenge._count.submissions,
                languages: challenge.languages.map(lang => lang.name),
                successRate: challenge.submissions.length > 0
                    ? Math.round((challenge.submissions.filter(s => s.status === 'ACCEPTED').length / challenge.submissions.length) * 100)
                    : 0
            })),
            categories, // Include all categories in the response
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to fetch challenges',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}