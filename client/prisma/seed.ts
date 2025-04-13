import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create admin users first
    const adminUser1 = await prisma.user.upsert({
        where: { email: 'admin.tech@codebattleground.com' },
        update: {},
        create: {
            email: 'admin.tech@codebattleground.com',
            password: '$2b$10$sP1MmzPx3Zd.4yJ8qH6q4eqVZ9NfSg/YmEz6YEDKbKVOyYYxSJHHe', // hashed password for 'Admin123!'
            name: 'Tech Lead',
            username: 'techlead',
            role: 'ADMIN',
            adminLead: {
                create: {
                    department: 'Technology',
                    responsibilities: ['System Architecture', 'Technical Decisions', 'Code Reviews'],
                    accessLevel: 3
                }
            }
        }
    });

    const adminUser2 = await prisma.user.upsert({
        where: { email: 'admin.content@codebattleground.com' },
        update: {},
        create: {
            email: 'admin.content@codebattleground.com',
            password: '$2b$10$sP1MmzPx3Zd.4yJ8qH6q4eqVZ9NfSg/YmEz6YEDKbKVOyYYxSJHHe', // hashed password for 'Admin123!'
            name: 'Content Lead',
            username: 'contentlead',
            role: 'ADMIN',
            adminLead: {
                create: {
                    department: 'Content',
                    responsibilities: ['Challenge Quality', 'Content Strategy', 'User Education'],
                    accessLevel: 2
                }
            }
        }
    });

    const challenge3 = await prisma.challenge.create({
        data: {
            title: 'Valid Parentheses',
            description: 'Given a string containing just the characters \'(\', \')\', \'{ \', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if: 1. Open brackets must be closed by the same type of brackets. 2. Open brackets must be closed in the correct order.',
            difficulty: 'MEDIUM',
            points: 25,
            creator: {
                connect: { id: adminUser1.id } // Replace with an actual user ID from your database
            },
            category: {
                connectOrCreate: {
                    where: { name: 'Stacks' },
                    create: { name: 'Stacks', description: 'Problems involving stack data structure' }
                }
            },
            timeLimit: 3000, // 3 seconds
            memoryLimit: 256 // 256 MB
        }
    });

    // Add test cases for the Valid Parentheses challenge with simplified inputs
    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge3.id,
                input: '()',
                output: 'true',
                isHidden: false,
                explanation: 'The string "()" is valid.'
            },
            {
                challengeId: challenge3.id,
                input: '()[]{}',
                output: 'true',
                isHidden: true,
                explanation: 'The string "()[]{}" is valid.'
            },
            {
                challengeId: challenge3.id,
                input: '(]',
                output: 'false',
                isHidden: true,
                explanation: 'The string "(]" is not valid.'
            }
        ]
    });

    const challenge4 = await prisma.challenge.create({
        data: {
            title: 'Binary Tree Level Order Traversal',
            description: 'Given a binary tree in level order format (root, left, right), return the level order traversal of its nodes\' values separated by spaces. For empty nodes, use the word "null".',
            difficulty: 'MEDIUM',
            points: 30,
            creator: {
                connect: { id: adminUser1.id } // Replace with an actual user ID from your database
            },
            category: {
                connectOrCreate: {
                    where: { name: 'Trees' },
                    create: { name: 'Trees', description: 'Problems involving tree data structure' }
                }
            },
            timeLimit: 4000, // 4 seconds
            memoryLimit: 512 // 512 MB
        }
    });

    // Add test cases for the Binary Tree Level Order Traversal challenge with simplified inputs
    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge4.id,
                input: '3 9 20 null null 15 7',
                output: '3 9 20 15 7',
                isHidden: false,
                explanation: 'The level order traversal of the tree is 3 9 20 15 7'
            },
            {
                challengeId: challenge4.id,
                input: '1',
                output: '1',
                isHidden: true,
                explanation: 'The level order traversal of the tree is 1'
            }
        ]
    });

    const challenge5 = await prisma.challenge.create({
        data: {
            title: 'Shortest Path in a Grid',
            description: 'Given a 2D grid with obstacles (1 represents obstacle, 0 represents an empty cell), find the shortest path from the top-left corner to the bottom-right corner. You can move up, down, left, or right. Return the path length or -1 if no path exists.',
            difficulty: 'MEDIUM',
            points: 35,
            creator: {
                connect: { id: adminUser1.id } // Replace with an actual user ID from your database
            },
            category: {
                connectOrCreate: {
                    where: { name: 'Graphs' },
                    create: { name: 'Graphs', description: 'Problems involving graph data structure' }
                }
            },
            timeLimit: 5000, // 5 seconds
            memoryLimit: 512 // 512 MB
        }
    });

    // Add test cases for the Shortest Path in a Grid challenge with simplified inputs
    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge5.id,
                input: '3 3\n0 0 0\n1 1 0\n1 1 0',
                output: '4',
                isHidden: false,
                explanation: 'The shortest path in the 3x3 grid with obstacles is 4 steps'
            },
            {
                challengeId: challenge5.id,
                input: '2 2\n0 1\n1 0',
                output: '2',
                isHidden: true,
                explanation: 'The shortest path in the 2x2 grid with obstacles is 2 steps'
            }
        ]
    });

    const challenge6 = await prisma.challenge.create({
        data: {
            title: 'Reverse a Linked List',
            description: 'Given the head of a singly linked list represented as space-separated integers, reverse the list and return the new list as space-separated integers.',
            difficulty: 'MEDIUM',
            points: 25,
            creator: {
                connect: { id: adminUser2.id } // Replace with an actual user ID from your database
            },
            category: {
                connectOrCreate: {
                    where: { name: 'Linked Lists' },
                    create: { name: 'Linked Lists', description: 'Problems involving linked list data structure' }
                }
            },
            timeLimit: 3000, // 3 seconds
            memoryLimit: 256 // 256 MB
        }
    });

    // Add test cases for the Reverse a Linked List challenge with simplified inputs
    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge6.id,
                input: '1 2 3 4 5',
                output: '5 4 3 2 1',
                isHidden: false,
                explanation: 'The reversed linked list of 1->2->3->4->5 is 5->4->3->2->1'
            },
            {
                challengeId: challenge6.id,
                input: '1 2',
                output: '2 1',
                isHidden: true,
                explanation: 'The reversed linked list of 1->2 is 2->1'
            }
        ]
    });

    const challenge7 = await prisma.challenge.create({
        data: {
            title: 'Implement a Queue using Stacks',
            description: 'Implement a first-in-first-out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty). For input, you\'ll receive operations as a line of commands, with each command followed by its argument on the same line.',
            difficulty: 'MEDIUM',
            points: 30,
            creator: {
                connect: { id: adminUser2.id } // Replace with an actual user ID from your database
            },
            category: {
                connectOrCreate: {
                    where: { name: 'Queues' },
                    create: { name: 'Queues', description: 'Problems involving queue data structure' }
                }
            },
            timeLimit: 4000, // 4 seconds
            memoryLimit: 512 // 512 MB
        }
    });

    // Add test cases for the Implement a Queue using Stacks challenge with simplified inputs
    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge7.id,
                input: 'MyQueue\npush 1\npush 2\npeek\npop\nempty',
                output: 'null\nnull\nnull\n1\n1\nfalse',
                isHidden: false,
                explanation: 'The operations on the queue result in the expected outputs'
            },
            {
                challengeId: challenge7.id,
                input: 'MyQueue\npush 1\npush 2\npop\npush 3\npop\npop',
                output: 'null\nnull\nnull\n1\nnull\n2\n3',
                isHidden: true,
                explanation: 'The operations on the queue result in the expected outputs'
            }
        ]
    });

    console.log('Seeded challenges and test cases successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });