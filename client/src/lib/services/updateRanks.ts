import prisma from "../prisma"

export async function updateUserRanks() {
    try {
        // Get all user profiles ordered by points (descending)
        const userProfiles = await prisma.userProfile.findMany({
            orderBy: {
                points: 'desc',
            },
        })

        // Update ranks for each user
        let currentRank = 1

        for (const profile of userProfiles) {
            // Update the user's rank
            await prisma.userProfile.update({
                where: { id: profile.id },
                data: { rank: currentRank++ },
            })
        }
    } catch (error) {
        console.error("Error updating user ranks:", error)
    }
}