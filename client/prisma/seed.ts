import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create admin users first
    const adminUser1 = await prisma.user.upsert({
        where: { email: 'admin.tech@codebattleground.com' },
        update: {},
        create: {
            email: 'admin.tech@codebattleground.com',
            password: '$2b$10$sP1MmzPx3Zd.4yJ8qH6q4eqVZ9NfSg/YmEz6YEDKbKVOyYYxSJHHe',
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
            password: '$2b$10$sP1MmzPx3Zd.4yJ8qH6q4eqVZ9NfSg/YmEz6YEDKbKVOyYYxSJHHe',
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

    // Create languages first
    const languages = await Promise.all([
        prisma.language.create({
            data: {
                name: 'C++',
                percentage: 0
            }
        }),
        prisma.language.create({
            data: {
                name: 'Ruby',
                percentage: 0
            }
        }),
        prisma.language.create({
            data: {
                name: 'C',
                percentage: 0
            }
        })
    ]);

    // Create categories first to ensure they exist
    const categories = await Promise.all([
        prisma.challengeCategory.upsert({
            where: { name: 'Strings' },
            update: {},
            create: {
                name: 'Strings',
                description: 'Problems involving string manipulation and algorithms'
            }
        }),
        prisma.challengeCategory.upsert({
            where: { name: 'Stacks' },
            update: {},
            create: {
                name: 'Stacks',
                description: 'Problems involving stack data structure'
            }
        }),
        prisma.challengeCategory.upsert({
            where: { name: 'Trees' },
            update: {},
            create: {
                name: 'Trees',
                description: 'Problems involving tree data structure'
            }
        }),
        prisma.challengeCategory.upsert({
            where: { name: 'Graphs' },
            update: {},
            create: {
                name: 'Graphs',
                description: 'Problems involving graph data structure'
            }
        }),
        prisma.challengeCategory.upsert({
            where: { name: 'Linked Lists' },
            update: {},
            create: {
                name: 'Linked Lists',
                description: 'Problems involving linked list data structure'
            }
        }),
        prisma.challengeCategory.upsert({
            where: { name: 'Queues' },
            update: {},
            create: {
                name: 'Queues',
                description: 'Problems involving queue data structure'
            }
        })
    ]);

    // Challenge 1: Valid Parentheses
    const challenge1 = await prisma.challenge.create({
        data: {
            title: 'Sum of Two Binary Numbers',
            description: 'Given two numbers. Add them and return the sum in binary format.',
            difficulty: 'EASY',
            points: 20,
            creatorId: adminUser1.id,
            challengeType: 'ALGORITHM',
            categoryId: categories.find(c => c.name === 'Strings')!.id,
            languages: {
                connect: languages.map(lang => ({ id: lang.id }))
            },
            timeLimit: 3000,
            memoryLimit: 256
        }
    });

    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge1.id,
                input: '1000 1010',
                output: '11010',
                isHidden: false,
                explanation: 'The sum of 1000 and 1010 in binary is 11010.'
            },
            {
                challengeId: challenge1.id,
                input: '1101 1011',
                output: '11000',
                isHidden: true,
                explanation: 'The sum of 1101 and 1011 in binary is 11000.'
            },
            {
                challengeId: challenge1.id,
                input: '101 111',
                output: '1100',
                isHidden: true,
                explanation: 'The sum of 101 and 111 in binary is 1100.'
            }
        ]
    });

    // Challenge 2: Binary Tree Level Order Traversal
    const challenge2 = await prisma.challenge.create({
        data: {
            title: 'Binary Tree Level Order Traversal',
            description: 'Given a binary tree in level order format (root, left, right), return the level order traversal of its nodes\' values separated by spaces. For empty nodes, use the word "null".',
            difficulty: 'MEDIUM',
            points: 30,
            creatorId: adminUser1.id,
            challengeType: 'DATA_STRUCTURE',
            categoryId: categories.find(c => c.name === 'Trees')!.id,
            languages: {
                connect: languages.map(lang => ({ id: lang.id }))
            },
            timeLimit: 4000,
            memoryLimit: 512
        }
    });

    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge2.id,
                input: '3 9 20 null null 15 7',
                output: '3 9 20 15 7',
                isHidden: false,
                explanation: 'The level order traversal of the tree is 3 9 20 15 7'
            },
            {
                challengeId: challenge2.id,
                input: '1',
                output: '1',
                isHidden: true,
                explanation: 'The level order traversal of the tree is 1'
            }
        ]
    });

    // Challenge 3: Shortest Path in a Grid
    const challenge3 = await prisma.challenge.create({
        data: {
            title: 'Shortest Path in a Grid',
            description: 'Given a 2D grid with obstacles (1 represents obstacle, 0 represents an empty cell), find the shortest path from the top-left corner to the bottom-right corner. You can move up, down, left, or right. Return the path length or -1 if no path exists.',
            difficulty: 'MEDIUM',
            points: 35,
            creatorId: adminUser1.id,
            challengeType: 'ALGORITHM',
            categoryId: categories.find(c => c.name === 'Graphs')!.id,
            languages: {
                connect: languages.map(lang => ({ id: lang.id }))
            },
            timeLimit: 5000,
            memoryLimit: 512
        }
    });

    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge3.id,
                input: '3 3\n0 0 0\n1 1 0\n1 1 0',
                output: '4',
                isHidden: false,
                explanation: 'The shortest path in the 3x3 grid with obstacles is 4 steps'
            },
            {
                challengeId: challenge3.id,
                input: '2 2\n0 1\n1 0',
                output: '2',
                isHidden: true,
                explanation: 'The shortest path in the 2x2 grid with obstacles is 2 steps'
            }
        ]
    });

    // Challenge 4: Reverse a Linked List
    const challenge4 = await prisma.challenge.create({
        data: {
            title: 'Reverse a Linked List',
            description: 'Given the head of a singly linked list represented as space-separated integers, reverse the list and return the new list as space-separated integers.',
            difficulty: 'MEDIUM',
            points: 25,
            creatorId: adminUser2.id,
            challengeType: 'DATA_STRUCTURE',
            categoryId: categories.find(c => c.name === 'Linked Lists')!.id,
            languages: {
                connect: languages.map(lang => ({ id: lang.id }))
            },
            timeLimit: 3000,
            memoryLimit: 256
        }
    });

    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge4.id,
                input: '1 2 3 4 5',
                output: '5 4 3 2 1',
                isHidden: false,
                explanation: 'The reversed linked list of 1->2->3->4->5 is 5->4->3->2->1'
            },
            {
                challengeId: challenge4.id,
                input: '1 2',
                output: '2 1',
                isHidden: true,
                explanation: 'The reversed linked list of 1->2 is 2->1'
            }
        ]
    });

    // Challenge 5: Implement a Queue using Stacks
    const challenge5 = await prisma.challenge.create({
        data: {
            title: 'Implement a Queue using Stacks',
            description: 'Implement a first-in-first-out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty). For input, you\'ll receive operations as a line of commands, with each command followed by its argument on the same line.',
            difficulty: 'MEDIUM',
            points: 30,
            creatorId: adminUser2.id,
            challengeType: 'DATA_STRUCTURE',
            categoryId: categories.find(c => c.name === 'Queues')!.id,
            languages: {
                connect: languages.map(lang => ({ id: lang.id }))
            },
            timeLimit: 4000,
            memoryLimit: 512
        }
    });

    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge5.id,
                input: 'MyQueue\npush 1\npush 2\npeek\npop\nempty',
                output: 'null\nnull\nnull\n1\n1\nfalse',
                isHidden: false,
                explanation: 'The operations on the queue result in the expected outputs'
            },
            {
                challengeId: challenge5.id,
                input: 'MyQueue\npush 1\npush 2\npop\npush 3\npop\npop',
                output: 'null\nnull\nnull\n1\nnull\n2\n3',
                isHidden: true,
                explanation: 'The operations on the queue result in the expected outputs'
            }
        ]
    });

    console.log('Database seeded successfully!');
    console.log(`Created ${languages.length} languages`);
    console.log(`Created ${categories.length} categories`);
    console.log('Created 5 challenges with test cases');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });