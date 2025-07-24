import { PrismaClient, CompetitionStatus, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCompetitions() {
  console.log('Seeding competitions...');

  const competitions = [
    {
      title: "Weekly Algorithm Challenge",
      description: "Solve a series of algorithm problems in a timed competition. Top performers win prizes and recognition.",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours duration
      status: CompetitionStatus.UPCOMING,
      difficulty: Difficulty.MEDIUM,
    },
    {
      title: "Graph Theory Marathon",
      description: "Test your graph algorithm skills with 5 challenging problems. From basic traversals to complex network flows.",
      startDate: new Date(Date.now() - 60 * 60 * 1000), // Started 1 hour ago
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // Ends in 2 hours
      status: CompetitionStatus.ACTIVE,
      difficulty: Difficulty.HARD,
    },
    {
      title: "Data Structure Showdown",
      description: "Implement and optimize various data structures to solve real-world problems efficiently.",
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
      status: CompetitionStatus.COMPLETED,
      difficulty: Difficulty.MEDIUM,
    },
    {
      title: "Dynamic Programming Challenge",
      description: "Master the art of breaking down complex problems into simpler subproblems.",
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours duration
      status: CompetitionStatus.UPCOMING,
      difficulty: Difficulty.EXPERT,
    },
    {
      title: "Beginner's Coding Contest",
      description: "A friendly competition designed for newcomers to competitive programming.",
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1.5 hours duration
      status: CompetitionStatus.UPCOMING,
      difficulty: Difficulty.EASY,
    }
  ];

  for (const competition of competitions) {
    try {
      const created = await prisma.competition.create({
        data: competition
      });
      console.log(`✓ Created competition: ${created.title}`);
    } catch (error) {
      console.error(`✗ Failed to create competition: ${competition.title}`, error);
    }
  }

  console.log('Competition seeding completed!');
}

async function main() {
  try {
    await seedCompetitions();
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedCompetitions }; 