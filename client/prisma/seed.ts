import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Create some challenges
    const challenge1 = await prisma.challenge.create({
        data: {
            title: 'Sum of Two Numbers',
            description: 'Write a function to return the sum of two numbers.',
            difficulty: 'EASY',
            points: 10,
            creator: {
                connect: { id: 'cm7rmo66q0008phswus9nnfmf' } // Replace with an actual user ID from your database
            },
            category: {
                connectOrCreate: {
                    where: { name: 'Basic Algorithms' },
                    create: { name: 'Basic Algorithms', description: 'Fundamental algorithmic problems' }
                }
            },
            starterCode: {
                "javascript": "function sum(a, b) {\n  // Your code here\n}",
                "python": "def sum(a, b):\n  # Your code here",
                "java": "class Solution {\n\tpublic int sumOfTwoNumbers(int a, int b) {\n\t// Write your code here\n\t}\n}",
            },
            handlerCode: {
                "javascript": "function handler(userCode, input) {\n  const [a, b] = input.split('\\n').map(Number);\n  return eval(userCode + `\\nsum(${a}, ${b});`);\n}",
                "python": "def handler(userCode, input):\n  a, b = map(int, input.split('\\n'))\n  exec(userCode)\n  return eval('sum(a, b)')",
                "java": "public class Handler {\n\tpublic static String handler(String userCode, String input) {\n\t\tString[] parts = input.split(\"\\\\n\");\n\t\tint a = Integer.parseInt(parts[0]);\n\t\tint b = Integer.parseInt(parts[1]);\n\t\treturn String.valueOf(new Solution().sumOfTwoNumbers(a, b));\n\t}\n}"
            },
            timeLimit: 2000, // 2 seconds
            memoryLimit: 128 // 128 MB
        }
    });
    
    const challenge2 = await prisma.challenge.create({
        data: {
            title: 'Palindrome Check',
            description: 'Write a function to check if a string is a palindrome.',
            difficulty: 'MEDIUM',
            points: 20,
            creator: {
                connect: { id: 'cm7rmo66q0008phswus9nnfmf' } // Replace with an actual user ID from your database
            },
            category: {
                connectOrCreate: {
                    where: { name: 'String Manipulation' },
                    create: { name: 'String Manipulation', description: 'Problems involving string operations' }
                }
            },
            starterCode: {
                "javascript": "function isPalindrome(str) {\n  // Your code here\n}",
                "python": "def is_palindrome(s):\n  # Your code here",
                "java": "class Solution {\n\tpublic boolean isPalindrome(String str) {\n\t// Write your code here\n\t}\n}"
            },
            handlerCode: {
                "javascript": "function handler(userCode, input) {\n  const str = input.trim();\n  return eval(userCode + `\\nisPalindrome('${str}');`);\n}",
                "python": "def handler(userCode, input):\n  s = input.strip()\n  exec(userCode)\n  return eval(f'is_palindrome(\"{s}\")')",
                "java": "public class Handler {\n\tpublic static String handler(String userCode, String input) {\n\t\tString str = input.trim();\n\t\treturn String.valueOf(new Solution().isPalindrome(str));\n\t}\n}"
            },
            timeLimit: 3000, // 3 seconds
            memoryLimit: 256 // 256 MB
        }
    });
    
    // Add test cases for the first challenge
    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge1.id,
                input: '1\n2',
                output: '3',
                isHidden: false,
                explanation: 'The sum of 1 and 2 is 3.'
            },
            {
                challengeId: challenge1.id,
                input: '5\n7',
                output: '12',
                isHidden: true,
                explanation: 'The sum of 5 and 7 is 12.'
            }
        ]
    });
    
    // Add test cases for the second challenge
    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge2.id,
                input: '"racecar"',
                output: 'true',
                isHidden: false,
                explanation: '"racecar" is a palindrome.'
            },
            {
                challengeId: challenge2.id,
                input: '"hello"',
                output: 'false',
                isHidden: true,
                explanation: '"hello" is not a palindrome.'
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