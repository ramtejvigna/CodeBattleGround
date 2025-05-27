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
        prisma.language.create({ data: { name: 'Java', percentage: 0 } }),
        prisma.language.create({ data: { name: 'R', percentage: 0 } }),
        prisma.language.create({ data: { name: 'C#', percentage: 0 } })
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

    console.log('Database seeded successfully!');
    console.log(`Created ${categories.length} categories`);
    console.log('Created 7 challenges with test cases');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
