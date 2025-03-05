import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock data for challenges
const mockChallenges = [
    {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: 'EASY',
        points: 100,
        category: 'Algorithms',
        likes: 0,
        submissions: 0,
        successRate: 0,
        createdAt: '2023-05-15T10:30:00Z',
    },
    {
        title: 'Merge K Sorted Lists',
        description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
        difficulty: 'HARD',
        points: 350,
        category: 'Data Structures',
        likes: 0,
        submissions: 0,
        successRate: 0,
        createdAt: '2023-06-22T14:15:00Z',
    },
    {
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        difficulty: 'MEDIUM',
        points: 200,
        category: 'Algorithms',
        likes: 0,
        submissions: 0,
        successRate: 0,
        createdAt: '2023-04-10T09:45:00Z',
    },
    {
        title: 'Design Twitter',
        description: 'Design a simplified version of Twitter where users can post tweets, follow/unfollow another user, and see the 10 most recent tweets in the user\'s news feed.',
        difficulty: 'EXPERT',
        points: 500,
        category: 'System Design',
        likes: 0,
        submissions: 0,
        successRate: 0,
        createdAt: '2023-07-05T16:20:00Z',
    },
    {
        title: 'LRU Cache',
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
        difficulty: 'MEDIUM',
        points: 250,
        category: 'Data Structures',
        likes: 0,
        submissions: 0,
        successRate: 0,
        createdAt: '2023-05-30T11:10:00Z',
    },
    {
        title: 'Binary Tree Maximum Path Sum',
        description: 'A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. Find the maximum path sum.',
        difficulty: 'HARD',
        points: 400,
        category: 'Algorithms',
        likes: 0,
        submissions: 0,
        successRate: 0,
        createdAt: '2023-06-15T13:25:00Z',
    },
];

async function main() {
    // Seed challenges
    for (const challengeData of mockChallenges) {
        await prisma.challenge.create({
            data: {
                title: challengeData.title,
                description: challengeData.description,
                difficulty: challengeData.difficulty as 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT',
                starterCode: {},  // Empty JSON object as starter code
                timeLimit: 60,    // Default time limit
                memoryLimit: 128, // Default memory limit
                creator: {        // Create a default creator
                    connectOrCreate: {
                        where: { 
                            email: 'vignaramtej46@gmail.com'
                        },
                        create: {
                            email: 'vignaramtej46@gmail.com',
                            username: 'vignaramtej'
                        }
                    }
                },
                points: challengeData.points,
                category: {
                    connectOrCreate: {
                        where: { name: challengeData.category },
                        create: { name: challengeData.category },
                    },
                },
                createdAt: new Date(challengeData.createdAt),
                updatedAt: new Date(challengeData.createdAt),
            },
        });
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });