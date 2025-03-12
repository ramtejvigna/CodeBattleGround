import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const challenge3 = await prisma.challenge.create({
        data: {
            title: 'Valid Parentheses',
            description: 'Given a string containing just the characters \'(\', \')\', \'{ \', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if: 1. Open brackets must be closed by the same type of brackets. 2. Open brackets must be closed in the correct order.',
            difficulty: 'MEDIUM',
            points: 25,
            creator: {
                connect: { id: 'cm7rmo66q0008phswus9nnfmf' } // Replace with an actual user ID from your database
            },
            category: {
                connectOrCreate: {
                    where: { name: 'Stacks' },
                    create: { name: 'Stacks', description: 'Problems involving stack data structure' }
                }
            },
            starterCode: {
                "javascript": "function isValid(s) {\n  // Your code here\n}",
                "python": "def is_valid(s):\n  # Your code here",
                "java": "class Solution {\n\tpublic boolean isValid(String s) {\n\t// Write your code here\n\t}\n}"
            },
            handlerCode: {
                "javascript": "function handler(userCode, input) {\n  const str = input.trim();\n  return eval(userCode + `\\nisValid('${str}');`);\n}",
                "python": "def handler(userCode, input):\n  s = input.strip()\n  exec(userCode)\n  return eval(f'is_valid(\"{s}\")')",
                "java": "public class Handler {\n\tpublic static String handler(String userCode, String input) {\n\t\tString str = input.trim();\n\t\treturn String.valueOf(new Solution().isValid(str));\n\t}\n}"
            },
            timeLimit: 3000, // 3 seconds
            memoryLimit: 256 // 256 MB
        }
    });

    // Add test cases for the Valid Parentheses challenge
    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge3.id,
                input: '"()"',
                output: 'true',
                isHidden: false,
                explanation: 'The string "()" is valid.'
            },
            {
                challengeId: challenge3.id,
                input: '"()[]{}"',
                output: 'true',
                isHidden: true,
                explanation: 'The string "()[]{}" is valid.'
            },
            {
                challengeId: challenge3.id,
                input: '"(]"',
                output: 'false',
                isHidden: true,
                explanation: 'The string "(]" is not valid.'
            }
        ]
    });

    const challenge4 = await prisma.challenge.create({
        data: {
            title: 'Binary Tree Level Order Traversal',
            description: 'Given a binary tree, return the level order traversal of its nodes\' values. (i.e., from left to right, level by level).',
            difficulty: 'MEDIUM',
            points: 30,
            creator: {
                connect: { id: 'cm7rmo66q0008phswus9nnfmf' } // Replace with an actual user ID from your database
            },
            category: {
                connectOrCreate: {
                    where: { name: 'Trees' },
                    create: { name: 'Trees', description: 'Problems involving tree data structure' }
                }
            },
            starterCode: {
                "javascript": "function levelOrder(root) {\n  // Your code here\n}",
                "python": "def level_order(root):\n  # Your code here",
                "java": "class Solution {\n\tpublic List<List<Integer>> levelOrder(TreeNode root) {\n\t// Write your code here\n\t}\n}"
            },
            handlerCode: {
                "javascript": "function handler(userCode, input) {\n  const root = JSON.parse(input);\n  return JSON.stringify(eval(userCode + `\\nlevelOrder(${JSON.stringify(root)});`));\n}",
                "python": "def handler(userCode, input):\n  from ast import literal_eval\n  root = literal_eval(input)\n  exec(userCode)\n  return str(eval(f'level_order({root})'))",
                "java": "public class Handler {\n\tpublic static String handler(String userCode, String input) {\n\t\tTreeNode root = TreeNode.deserialize(input);\n\t\treturn new Solution().levelOrder(root).toString();\n\t}\n}"
            },
            timeLimit: 4000, // 4 seconds
            memoryLimit: 512 // 512 MB
        }
    });

    // Add test cases for the Binary Tree Level Order Traversal challenge
    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge4.id,
                input: '[3,9,20,null,null,15,7]',
                output: '[[3],[9,20],[15,7]]',
                isHidden: false,
                explanation: 'The level order traversal of the tree [3,9,20,null,null,15,7] is [[3],[9,20],[15,7]].'
            },
            {
                challengeId: challenge4.id,
                input: '[1]',
                output: '[[1]]',
                isHidden: true,
                explanation: 'The level order traversal of the tree [1] is [[1]].'
            }
        ]
    });

    const challenge5 = await prisma.challenge.create({
        data: {
            title: 'Shortest Path in a Grid',
            description: 'Given a 2D grid with obstacles, find the shortest path from the top-left corner to the bottom-right corner. You can move up, down, left, or right.',
            difficulty: 'MEDIUM',
            points: 35,
            creator: {
                connect: { id: 'cm7rmo66q0008phswus9nnfmf' } // Replace with an actual user ID from your database
            },
            category: {
                connectOrCreate: {
                    where: { name: 'Graphs' },
                    create: { name: 'Graphs', description: 'Problems involving graph data structure' }
                }
            },
            starterCode: {
                "javascript": "function shortestPath(grid) {\n  // Your code here\n}",
                "python": "def shortest_path(grid):\n  # Your code here",
                "java": "class Solution {\n\tpublic int shortestPath(int[][] grid) {\n\t// Write your code here\n\t}\n}"
            },
            handlerCode: {
                "javascript": "function handler(userCode, input) {\n  const grid = JSON.parse(input);\n  return JSON.stringify(eval(userCode + `\\nshortestPath(${JSON.stringify(grid)});`));\n}",
                "python": "def handler(userCode, input):\n  from ast import literal_eval\n  grid = literal_eval(input)\n  exec(userCode)\n  return str(eval(f'shortest_path({grid})'))",
                "java": "public class Handler {\n\tpublic static String handler(String userCode, String input) {\n\t\tint[][] grid = JSON.parse(input);\n\t\treturn String.valueOf(new Solution().shortestPath(grid));\n\t}\n}"
            },
            timeLimit: 5000, // 5 seconds
            memoryLimit: 512 // 512 MB
        }
    });

    // Add test cases for the Shortest Path in a Grid challenge
    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge5.id,
                input: '[[0,0,0],[1,1,0],[1,1,0]]',
                output: '4',
                isHidden: false,
                explanation: 'The shortest path in the grid [[0,0,0],[1,1,0],[1,1,0]] is 4.'
            },
            {
                challengeId: challenge5.id,
                input: '[[0,1],[1,0]]',
                output: '2',
                isHidden: true,
                explanation: 'The shortest path in the grid [[0,1],[1,0]] is 2.'
            }
        ]
    });

    const challenge6 = await prisma.challenge.create({
        data: {
            title: 'Reverse a Linked List',
            description: 'Given the head of a singly linked list, reverse the list and return the new head.',
            difficulty: 'MEDIUM',
            points: 25,
            creator: {
                connect: { id: 'cm7rmo66q0008phswus9nnfmf' } // Replace with an actual user ID from your database
            },
            category: {
                connectOrCreate: {
                    where: { name: 'Linked Lists' },
                    create: { name: 'Linked Lists', description: 'Problems involving linked list data structure' }
                }
            },
            starterCode: {
                "javascript": "function reverseList(head) {\n  // Your code here\n}",
                "python": "def reverse_list(head):\n  # Your code here",
                "java": "class Solution {\n\tpublic ListNode reverseList(ListNode head) {\n\t// Write your code here\n\t}\n}"
            },
            handlerCode: {
                "javascript": "function handler(userCode, input) {\n  const head = JSON.parse(input);\n  return JSON.stringify(eval(userCode + `\\nreverseList(${JSON.stringify(head)});`));\n}",
                "python": "def handler(userCode, input):\n  from ast import literal_eval\n  head = literal_eval(input)\n  exec(userCode)\n  return str(eval(f'reverse_list({head})'))",
                "java": "public class Handler {\n\tpublic static String handler(String userCode, String input) {\n\t\tListNode head = ListNode.deserialize(input);\n\t\treturn ListNode.serialize(new Solution().reverseList(head));\n\t}\n}"
            },
            timeLimit: 3000, // 3 seconds
            memoryLimit: 256 // 256 MB
        }
    });

    // Add test cases for the Reverse a Linked List challenge
    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge6.id,
                input: '[1,2,3,4,5]',
                output: '[5,4,3,2,1]',
                isHidden: false,
                explanation: 'The reversed linked list of [1,2,3,4,5] is [5,4,3,2,1].'
            },
            {
                challengeId: challenge6.id,
                input: '[1,2]',
                output: '[2,1]',
                isHidden: true,
                explanation: 'The reversed linked list of [1,2] is [2,1].'
            }
        ]
    });

    const challenge7 = await prisma.challenge.create({
        data: {
            title: 'Implement a Queue using Stacks',
            description: 'Implement a first-in-first-out (FIFO) queue using only two stacks. The implemented queue should support all the functions of a normal queue (push, peek, pop, and empty).',
            difficulty: 'MEDIUM',
            points: 30,
            creator: {
                connect: { id: 'cm7rmo66q0008phswus9nnfmf' } // Replace with an actual user ID from your database
            },
            category: {
                connectOrCreate: {
                    where: { name: 'Queues' },
                    create: { name: 'Queues', description: 'Problems involving queue data structure' }
                }
            },
            starterCode: {
                "javascript": "class MyQueue {\n  constructor() {\n    // Your code here\n  }\n  push(x) {\n    // Your code here\n  }\n  pop() {\n    // Your code here\n  }\n  peek() {\n    // Your code here\n  }\n  empty() {\n    // Your code here\n  }\n}",
                "python": "class MyQueue:\n    def __init__(self):\n        # Your code here\n    def push(self, x):\n        # Your code here\n    def pop(self):\n        # Your code here\n    def peek(self):\n        # Your code here\n    def empty(self):\n        # Your code here",
                "java": "class MyQueue {\n\tpublic MyQueue() {\n\t\t// Your code here\n\t}\n\tpublic void push(int x) {\n\t\t// Your code here\n\t}\n\tpublic int pop() {\n\t\t// Your code here\n\t}\n\tpublic int peek() {\n\t\t// Your code here\n\t}\n\tpublic boolean empty() {\n\t\t// Your code here\n\t}\n}"
            },
            handlerCode: {
                "javascript": "function handler(userCode, input) {\n  const commands = JSON.parse(input);\n  const queue = new (eval(userCode + '\\nMyQueue'));\n  const results = [];\n  commands.forEach(cmd => {\n    const [method, ...args] = cmd;\n    if (method === 'MyQueue') {\n      results.push(null);\n    } else {\n      results.push(queue[method](...args));\n    }\n  });\n  return JSON.stringify(results);\n}",
                "python": "def handler(userCode, input):\n  from ast import literal_eval\n  commands = literal_eval(input)\n  exec(userCode)\n  queue = MyQueue()\n  results = []\n  for cmd in commands:\n    method, *args = cmd\n    if method == 'MyQueue':\n      results.append(None)\n    else:\n      results.append(getattr(queue, method)(*args))\n  return str(results)",
                "java": "public class Handler {\n\tpublic static String handler(String userCode, String input) {\n\t\tList<List<Object>> commands = JSON.parse(input);\n\t\tMyQueue queue = new MyQueue();\n\t\tList<Object> results = new ArrayList<>();\n\t\tfor (List<Object> cmd : commands) {\n\t\t\tString method = (String) cmd.get(0);\n\t\t\tif (method.equals('MyQueue')) {\n\t\t\t\tresults.add(null);\n\t\t\t} else {\n\t\t\t\tObject[] args = cmd.subList(1, cmd.size()).toArray();\n\t\t\t\ttry {\n\t\t\t\t\tMethod m = queue.getClass().getMethod(method, Arrays.stream(args).map(Object::getClass).toArray(Class[]::new));\n\t\t\t\t\tresults.add(m.invoke(queue, args));\n\t\t\t\t} catch (Exception e) {\n\t\t\t\t\tresults.add(null);\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\treturn results.toString();\n\t}\n}"
            },
            timeLimit: 4000, // 4 seconds
            memoryLimit: 512 // 512 MB
        }
    });

    // Add test cases for the Implement a Queue using Stacks challenge
    await prisma.testCase.createMany({
        data: [
            {
                challengeId: challenge7.id,
                input: '[["MyQueue"], ["push", 1], ["push", 2], ["peek"], ["pop"], ["empty"]]',
                output: '[null, null, null, 1, 1, false]',
                isHidden: false,
                explanation: 'The operations on the queue result in [null, null, null, 1, 1, false].'
            },
            {
                challengeId: challenge7.id,
                input: '[["MyQueue"], ["push", 1], ["push", 2], ["pop"], ["push", 3], ["pop"], ["pop"]]',
                output: '[null, null, null, 1, null, 2, 3]',
                isHidden: true,
                explanation: 'The operations on the queue result in [null, null, null, 1, null, 2, 3].'
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