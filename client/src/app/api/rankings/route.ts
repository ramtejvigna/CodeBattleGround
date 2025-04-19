import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // First, get all user profiles with their user role information
    const allUserProfiles = await prisma.userProfile.findMany({
      orderBy: {
        points: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            username: true,
            image: true,
            role: true, // Include role to filter out admins
          },
        },
        badges: {
          take: 3,
        },
      },
    });

    // Filter out admin users and assign consecutive ranks to regular users
    const topUsers = allUserProfiles
      .filter(profile => profile.user.role !== "ADMIN")
      .map((profile, index) => ({
        ...profile,
        rank: index + 1 // Assign consecutive ranks starting from 1
      }));

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