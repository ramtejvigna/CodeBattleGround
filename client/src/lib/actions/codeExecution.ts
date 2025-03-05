// @/lib/actions/codeExecution

import Docker from 'dockerode';

const docker = new Docker();

interface TestCase {
    input: string;
    output: string;
}

interface ExecutionResult {
    status: 'ACCEPTED' | 'WRONG_ANSWER';
    results: {
        input: string;
        expectedOutput: string;
        actualOutput: string;
        passed: boolean;
    }[];
    runtime: number;
    memory: number;
}

export async function runCodeInDocker(
    code: string, 
    languageId: string, 
    testCases: TestCase[]
): Promise<ExecutionResult> {
    try {
        const container = await docker.createContainer({
            Image: `code-execution-${languageId}`, // Assume you have Docker images for each language
            Cmd: ['sh', '-c', code],
            Tty: false,
            AttachStdout: true,
            AttachStderr: true,
        });
    
        await container.start();
    
        const startTime = Date.now();
    
        const stream = await container.logs({ follow: true, stdout: true, stderr: true });
    
        let output = '';
        stream.on('data', (chunk) => {
            output += chunk.toString();
        });
    
        await new Promise((resolve) => stream.on('end', resolve));
    
        const endTime = Date.now();
        const runtime = endTime - startTime;
    
        const stats = await container.stats({ stream: false });
        const memoryUsage = stats.memory_stats.usage || 0; // in bytes
        const memory = memoryUsage / 1024; // convert to KB
    
        const results = testCases.map((testCase) => {
            const actualOutput = output.trim(); // Assuming the output is the last line
            return {
                input: testCase.input,
                expectedOutput: testCase.output,
                actualOutput,
                passed: actualOutput === testCase.output,
            };
        });
    
        const allPassed = results.every((result) => result.passed);
        const status = allPassed ? 'ACCEPTED' : 'WRONG_ANSWER';
    
        await container.remove();
    
        return {
            status,
            results,
            runtime, 
            memory 
        };
    } catch (error) {
        console.error('Error running code in Docker:', error);
        throw new Error('Failed to execute code in Docker');
    }
}

// Simulated runtime in milliseconds and memory in KB