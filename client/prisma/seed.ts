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

    // Add new languages
    const newLanguages = await Promise.all([
        prisma.language.create({ data: { name: 'JavaScript', percentage: 0 } }),
        prisma.language.create({ data: { name: 'Python', percentage: 0 } }),
        prisma.language.create({ data: { name: 'Java', percentage: 0 } }),
        prisma.language.create({ data: { name: 'R', percentage: 0 } }),
        prisma.language.create({ data: { name: 'C#', percentage: 0 } }),
        prisma.language.create({ data: { name: 'TypeScript', percentage: 0 } }),
        prisma.language.create({ data: { name: 'Go', percentage: 0 } }),
        prisma.language.create({ data: { name: 'Rust', percentage: 0 } })
    ]);


    // Create categories
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

    // Challenge 6: Palindrome Checker
    const challenge6 = await prisma.challenge.create({
        data: {
            title: 'Palindrome Checker',
            description: 'Check whether a given string is a palindrome. Ignore cases and non-alphanumeric characters.',
            difficulty: 'EASY',
            points: 15,
            creatorId: adminUser2.id,
            challengeType: 'ALGORITHM',
            categoryId: categories.find(c => c.name === 'Strings')!.id,
            languages: {
                connect: newLanguages.filter(l => ['Java', 'C#'].includes(l.name)).map(l => ({ id: l.id }))
            },
            timeLimit: 2000,
            memoryLimit: 128
        }
    });

    await prisma.testCase.createMany({
        data: [
            { challengeId: challenge6.id, input: 'A man, a plan, a canal: Panama', output: 'true', isHidden: false, explanation: 'It is a palindrome' },
            { challengeId: challenge6.id, input: 'race a car', output: 'false', isHidden: true, explanation: 'It is not a palindrome' }
        ]
    });

    // Challenge 7: Data Summarizer
    const challenge7 = await prisma.challenge.create({
        data: {
            title: 'Data Summarizer',
            description: 'Given a list of numbers, return the mean, median, and mode as space-separated values.',
            difficulty: 'MEDIUM',
            points: 40,
            creatorId: adminUser1.id,
            challengeType: 'ALGORITHM',
            categoryId: categories.find(c => c.name === 'Stacks')!.id,
            languages: {
                connect: newLanguages.filter(l => l.name === 'R').map(l => ({ id: l.id }))
            },
            timeLimit: 3000,
            memoryLimit: 256
        }
    });

    await prisma.testCase.createMany({
        data: [
            { challengeId: challenge7.id, input: '1 2 2 3 4', output: '2.4 2 2', isHidden: false, explanation: 'Summary stats' },
            { challengeId: challenge7.id, input: '', output: 'NA NA NA', isHidden: true, explanation: 'No data' }
        ]
    });

    // Challenge 8: Two Sum
    const challenge8 = await prisma.challenge.create({
        data: {
            title: 'Two Sum',
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            difficulty: 'EASY',
            points: 20,
            creatorId: adminUser1.id,
            challengeType: 'ALGORITHM',
            categoryId: categories.find(c => c.name === 'Strings')!.id,
            languages: {
                connect: newLanguages.filter(l => ['Python', 'JavaScript', 'Java'].includes(l.name)).map(l => ({ id: l.id }))
            },
            timeLimit: 2000,
            memoryLimit: 128
        }
    });

    await prisma.testCase.createMany({
        data: [
            { challengeId: challenge8.id, input: '[2,7,11,15]\n9', output: '[0,1]', isHidden: false, explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
            { challengeId: challenge8.id, input: '[3,2,4]\n6', output: '[1,2]', isHidden: false, explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
            { challengeId: challenge8.id, input: '[3,3]\n6', output: '[0,1]', isHidden: true, explanation: 'nums[0] + nums[1] = 3 + 3 = 6' }
        ]
    });

    // Challenge 9: Valid Parentheses
    const challenge9 = await prisma.challenge.create({
        data: {
            title: 'Valid Parentheses',
            description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.',
            difficulty: 'EASY',
            points: 15,
            creatorId: adminUser2.id,
            challengeType: 'ALGORITHM',
            categoryId: categories.find(c => c.name === 'Stacks')!.id,
            languages: {
                connect: newLanguages.filter(l => ['Python', 'JavaScript', 'Java'].includes(l.name)).map(l => ({ id: l.id }))
            },
            timeLimit: 1000,
            memoryLimit: 128
        }
    });

    await prisma.testCase.createMany({
        data: [
            { challengeId: challenge9.id, input: '()', output: 'true', isHidden: false, explanation: 'Valid parentheses' },
            { challengeId: challenge9.id, input: '()[]{}\n', output: 'true', isHidden: false, explanation: 'Valid mixed parentheses' },
            { challengeId: challenge9.id, input: '(]', output: 'false', isHidden: false, explanation: 'Invalid parentheses' },
            { challengeId: challenge9.id, input: '([)]', output: 'false', isHidden: true, explanation: 'Invalid nesting' }
        ]
    });

    // Challenge 10: Fibonacci Sequence
    const challenge10 = await prisma.challenge.create({
        data: {
            title: 'Fibonacci Number',
            description: 'Given n, calculate F(n) where F(n) is the nth Fibonacci number. F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2) for n > 1.',
            difficulty: 'EASY',
            points: 10,
            creatorId: adminUser1.id,
            challengeType: 'ALGORITHM',
            categoryId: categories.find(c => c.name === 'Strings')!.id,
            languages: {
                connect: newLanguages.filter(l => ['Python', 'JavaScript', 'Java', 'TypeScript'].includes(l.name)).map(l => ({ id: l.id }))
            },
            timeLimit: 1000,
            memoryLimit: 64
        }
    });

    await prisma.testCase.createMany({
        data: [
            { challengeId: challenge10.id, input: '2', output: '1', isHidden: false, explanation: 'F(2) = F(1) + F(0) = 1 + 0 = 1' },
            { challengeId: challenge10.id, input: '3', output: '2', isHidden: false, explanation: 'F(3) = F(2) + F(1) = 1 + 1 = 2' },
            { challengeId: challenge10.id, input: '4', output: '3', isHidden: false, explanation: 'F(4) = F(3) + F(2) = 2 + 1 = 3' },
            { challengeId: challenge10.id, input: '10', output: '55', isHidden: true, explanation: 'F(10) = 55' }
        ]
    });

    // Challenge 11: Binary Tree Inorder Traversal
    const challenge11 = await prisma.challenge.create({
        data: {
            title: 'Binary Tree Inorder Traversal',
            description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',
            difficulty: 'MEDIUM',
            points: 35,
            creatorId: adminUser1.id,
            challengeType: 'DATA_STRUCTURE',
            categoryId: categories.find(c => c.name === 'Trees')!.id,
            languages: {
                connect: newLanguages.filter(l => ['Python', 'Java', 'JavaScript'].includes(l.name)).map(l => ({ id: l.id }))
            },
            timeLimit: 3000,
            memoryLimit: 256
        }
    });

    await prisma.testCase.createMany({
        data: [
            { challengeId: challenge11.id, input: '[1,null,2,3]', output: '[1,3,2]', isHidden: false, explanation: 'Inorder traversal: left, root, right' },
            { challengeId: challenge11.id, input: '[]', output: '[]', isHidden: false, explanation: 'Empty tree' },
            { challengeId: challenge11.id, input: '[1]', output: '[1]', isHidden: false, explanation: 'Single node' },
            { challengeId: challenge11.id, input: '[1,2,3,4,5,null,8,null,null,6,7,9]', output: '[4,2,6,5,7,1,3,9,8]', isHidden: true, explanation: 'Complex tree traversal' }
        ]
    });

    // Challenge 12: Maximum Subarray
    const challenge12 = await prisma.challenge.create({
        data: {
            title: 'Maximum Subarray',
            description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
            difficulty: 'MEDIUM',
            points: 30,
            creatorId: adminUser2.id,
            challengeType: 'ALGORITHM',
            categoryId: categories.find(c => c.name === 'Strings')!.id,
            languages: {
                connect: newLanguages.filter(l => ['Python', 'JavaScript', 'Java', 'Go'].includes(l.name)).map(l => ({ id: l.id }))
            },
            timeLimit: 2000,
            memoryLimit: 128
        }
    });

    await prisma.testCase.createMany({
        data: [
            { challengeId: challenge12.id, input: '[-2,1,-3,4,-1,2,1,-5,4]', output: '6', isHidden: false, explanation: '[4,-1,2,1] has the largest sum = 6' },
            { challengeId: challenge12.id, input: '[1]', output: '1', isHidden: false, explanation: 'Single element' },
            { challengeId: challenge12.id, input: '[5,4,-1,7,8]', output: '23', isHidden: false, explanation: 'All elements sum to 23' },
            { challengeId: challenge12.id, input: '[-1,-2,-3,-4]', output: '-1', isHidden: true, explanation: 'All negative, return the largest' }
        ]
    });

    // Challenge 13: Merge Two Sorted Lists
    const challenge13 = await prisma.challenge.create({
        data: {
            title: 'Merge Two Sorted Lists',
            description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.',
            difficulty: 'EASY',
            points: 25,
            creatorId: adminUser1.id,
            challengeType: 'DATA_STRUCTURE',
            categoryId: categories.find(c => c.name === 'Linked Lists')!.id,
            languages: {
                connect: newLanguages.filter(l => ['Python', 'Java', 'JavaScript'].includes(l.name)).map(l => ({ id: l.id }))
            },
            timeLimit: 2000,
            memoryLimit: 128
        }
    });

    await prisma.testCase.createMany({
        data: [
            { challengeId: challenge13.id, input: '[1,2,4]\n[1,3,4]', output: '[1,1,2,3,4,4]', isHidden: false, explanation: 'Merge two sorted lists' },
            { challengeId: challenge13.id, input: '[]\n[]', output: '[]', isHidden: false, explanation: 'Both lists empty' },
            { challengeId: challenge13.id, input: '[]\n[0]', output: '[0]', isHidden: false, explanation: 'One list empty' },
            { challengeId: challenge13.id, input: '[1,2,3]\n[4,5,6]', output: '[1,2,3,4,5,6]', isHidden: true, explanation: 'No overlapping elements' }
        ]
    });

    // Challenge 14: Binary Search
    const challenge14 = await prisma.challenge.create({
        data: {
            title: 'Binary Search',
            description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.',
            difficulty: 'EASY',
            points: 15,
            creatorId: adminUser2.id,
            challengeType: 'ALGORITHM',
            categoryId: categories.find(c => c.name === 'Strings')!.id,
            languages: {
                connect: newLanguages.filter(l => ['Python', 'JavaScript', 'Java', 'Go', 'Rust'].includes(l.name)).map(l => ({ id: l.id }))
            },
            timeLimit: 1000,
            memoryLimit: 64
        }
    });

    await prisma.testCase.createMany({
        data: [
            { challengeId: challenge14.id, input: '[-1,0,3,5,9,12]\n9', output: '4', isHidden: false, explanation: '9 exists in nums and its index is 4' },
            { challengeId: challenge14.id, input: '[-1,0,3,5,9,12]\n2', output: '-1', isHidden: false, explanation: '2 does not exist in nums so return -1' },
            { challengeId: challenge14.id, input: '[5]\n5', output: '0', isHidden: false, explanation: 'Single element found' },
            { challengeId: challenge14.id, input: '[1,2,3,4,5,6,7,8,9,10]\n1', output: '0', isHidden: true, explanation: 'First element' }
        ]
    });

    // Challenge 15: Depth First Search in Graph
    const challenge15 = await prisma.challenge.create({
        data: {
            title: 'Graph DFS Traversal',
            description: 'Given a graph represented as an adjacency list, perform a depth-first search starting from node 0 and return the order of visited nodes.',
            difficulty: 'MEDIUM',
            points: 40,
            creatorId: adminUser1.id,
            challengeType: 'DATA_STRUCTURE',
            categoryId: categories.find(c => c.name === 'Graphs')!.id,
            languages: {
                connect: newLanguages.filter(l => ['Python', 'Java', 'JavaScript', 'TypeScript'].includes(l.name)).map(l => ({ id: l.id }))
            },
            timeLimit: 3000,
            memoryLimit: 256
        }
    });

    await prisma.testCase.createMany({
        data: [
            { challengeId: challenge15.id, input: '[[1,2],[0,3],[0,4],[1],[2]]', output: '[0,1,3,2,4]', isHidden: false, explanation: 'DFS traversal from node 0' },
            { challengeId: challenge15.id, input: '[[1],[0]]', output: '[0,1]', isHidden: false, explanation: 'Simple two-node graph' },
            { challengeId: challenge15.id, input: '[[]]', output: '[0]', isHidden: false, explanation: 'Single isolated node' },
            { challengeId: challenge15.id, input: '[[1,2,3],[0],[0],[0]]', output: '[0,1,2,3]', isHidden: true, explanation: 'Star graph pattern' }
        ]
    });

    // Challenge 16: Queue Implementation
    const challenge16 = await prisma.challenge.create({
        data: {
            title: 'Implement Queue using Stacks',
            description: 'Implement a first in first out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue.',
            difficulty: 'EASY',
            points: 20,
            creatorId: adminUser2.id,
            challengeType: 'DATA_STRUCTURE',
            categoryId: categories.find(c => c.name === 'Queues')!.id,
            languages: {
                connect: newLanguages.filter(l => ['Python', 'JavaScript', 'Java', 'TypeScript'].includes(l.name)).map(l => ({ id: l.id }))
            },
            timeLimit: 2000,
            memoryLimit: 128
        }
    });

    await prisma.testCase.createMany({
        data: [
            { challengeId: challenge16.id, input: '["MyQueue","push","push","peek","pop","empty"]\n[[],[1],[2],[],[],[]]', output: '[null,null,null,1,1,false]', isHidden: false, explanation: 'Queue operations' },
            { challengeId: challenge16.id, input: '["MyQueue","push","pop","push","pop","empty"]\n[[],[1],[],[2],[],[]]', output: '[null,null,1,null,2,true]', isHidden: true, explanation: 'Mixed operations' }
        ]
    });

    console.log('Database seeded successfully!');
    console.log(`Created ${categories.length} categories`);
    console.log(`Created ${newLanguages.length} languages`);
    console.log('Created 16 challenges with test cases');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
