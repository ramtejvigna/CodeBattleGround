import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const topUsers = await prisma.userProfile.findMany({
      take: 100,
      orderBy: {
        points: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            image: true,
          },
        },
        badges: {
          take: 3,
        },
      },
    });

    return new Response(JSON.stringify(topUsers), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch rankings" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}