import Docker from "dockerode";
import * as fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";
import { randomUUID } from "crypto";

// Initialize Docker outside API handler to prevent re-initialization on each request
let docker: Docker | null = null;

// Function to get Docker instance with lazy initialization
export function getDockerInstance(): Docker {
    if (!docker) {
        // When running in a production environment, we should use the Docker socket
        docker = new Docker();
    }
    return docker;
}

// Code execution function moved from route.ts to this utility file
export async function executeCodeInDocker(
    code: string,
    language: string,
    handlerCode: string,
    input: string,
    expectedOutput: string,
    timeLimit: number,
    memoryLimit: number
) {
    const executionId = randomUUID();

    // Create temp directory for code execution
    const tempDir = path.join(process.cwd(), "tmp", executionId);
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    let mainFile, runtimeImage, execCommand;

    // Language-specific setups
    switch (language.toLowerCase()) {
        case "javascript":
            mainFile = path.join(tempDir, "solution.js");
            await writeFile(mainFile, code);

            const jsHandlerFile = path.join(tempDir, "handler.js");
            await writeFile(
                jsHandlerFile,
                `
          ${handlerCode}
          
          const fs = require('fs');
          const input = fs.readFileSync('/app/input.txt', 'utf8');
          const output = handler(\`${code.replace(/`/g, "\\`")}\`, input);
          fs.writeFileSync('/app/output.txt', String(output));
        `
            );

            runtimeImage = "node:18-alpine";
            execCommand = ["node", "/app/handler.js"];
            break;

        case "python":
            mainFile = path.join(tempDir, "solution.py");
            await writeFile(mainFile, code);

            const pyHandlerFile = path.join(tempDir, "handler.py");
            await writeFile(
                pyHandlerFile,
                `
  ${handlerCode}
  
  import sys
  
  with open('/app/input.txt', 'r') as f:
      input_data = f.read()
  
  result = handler('''${code.replace(/'''/g, "\\'\\'\\'")}''', input_data)
  with open('/app/output.txt', 'w') as f:
      f.write(str(result))
        `
            );

            runtimeImage = "python:3.11-alpine";
            execCommand = ["python", "/app/handler.py"];
            break;

        case "java":
            mainFile = path.join(tempDir, "Solution.java");
            await writeFile(mainFile, code);

            const javaHandlerFile = path.join(tempDir, "Handler.java");
            await writeFile(javaHandlerFile, handlerCode);

            const javaMainFile = path.join(tempDir, "Main.java");
            await writeFile(
                javaMainFile,
                `
  import java.io.File;
  import java.io.FileWriter;
  import java.nio.file.Files;
  import java.nio.file.Paths;
  
  public class Main {
      public static void main(String[] args) throws Exception {
          String input = new String(Files.readAllBytes(Paths.get("/app/input.txt")));
          String userCode = new String(Files.readAllBytes(Paths.get("/app/Solution.java")));
          
          String result = Handler.handler(userCode, input);
          
          FileWriter writer = new FileWriter("/app/output.txt");
          writer.write(result);
          writer.close();
      }
  }
        `
            );

            runtimeImage = "openjdk:17-slim";
            execCommand = ["/bin/sh", "-c", "cd /app && javac *.java && java Main"];
            break;

        default:
            throw new Error(`Unsupported language: ${language}`);
    }

    // Write input to file
    await writeFile(path.join(tempDir, "input.txt"), input);

    try {
        // Get Docker instance
        const docker = getDockerInstance();

        // Create container with resource limits
        const container = await docker.createContainer({
            Image: runtimeImage,
            Cmd: execCommand,
            HostConfig: {
                Binds: [`${tempDir}:/app`],
                Memory: memoryLimit * 1024 * 1024, // Convert MB to bytes
                MemorySwap: memoryLimit * 1024 * 1024, // Disable swap
                NanoCpus: 1000000000, // Use 1 CPU core
                PidsLimit: 50, // Limit number of processes
                ReadonlyRootfs: true, // Make root filesystem read-only
                NetworkMode: "none", // Disable network
            },
            StopTimeout: timeLimit, // Container timeout in seconds
        });

        // Start execution timer
        const startTime = Date.now();

        // Start container
        await container.start();

        // Wait for container to finish or timeout
        const executionPromise = new Promise((resolve, reject) => {
            container.wait((err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        let executionResult: any;
        let timedOut = false;

        try {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    timedOut = true;
                    reject(new Error("TIME_LIMIT_EXCEEDED"));
                }, timeLimit * 1000); // Convert to milliseconds
            });

            executionResult = await Promise.race([executionPromise, timeoutPromise]);
        } catch (error) {
            if (timedOut) {
                try {
                    await container.stop();
                } catch (stopError) {
                    console.error("Error stopping container:", stopError);
                }
                executionResult = { StatusCode: 124, Error: "TIME_LIMIT_EXCEEDED" };
            } else {
                throw error;
            }
        }

        // Calculate runtime
        const runtime = Date.now() - startTime;

        // Get container stats for memory usage
        const stats = await container.stats({ stream: false });
        const memoryUsage = stats.memory_stats.usage / 1024; // Convert bytes to KB

        let output = "";
        let error = "";
        let status = "";

        if (!timedOut) {
            // Read execution output
            if (fs.existsSync(path.join(tempDir, "output.txt"))) {
                output = fs
                    .readFileSync(path.join(tempDir, "output.txt"), "utf8")
                    .trim();
            }

            // Get logs for error messages
            const logs = await container.logs({
                stdout: true,
                stderr: true,
            });
            error = logs.toString("utf8");

            // Check execution status
            if (executionResult && executionResult.StatusCode !== 0) {
                if (
                    error.includes("OutOfMemoryError") ||
                    memoryUsage >= memoryLimit * 1024
                ) {
                    status = "MEMORY_LIMIT_EXCEEDED";
                } else {
                    status = "RUNTIME_ERROR";
                }
            }
        } else {
            status = "TIME_LIMIT_EXCEEDED";
        }

        // Clean up container
        try {
            await container.remove({ force: true });
        } catch (removeError) {
            console.error("Error removing container:", removeError);
        }

        // Compare output with expected output
        const passed = output.trim() === expectedOutput.trim() && !status;

        return {
            passed,
            output: output || error,
            error: status,
            runtime,
            memory: Math.round(memoryUsage),
        };
    } catch (error) {
        console.error("Docker execution error:", error);
        throw error;
    } finally {
        // Clean up temp files
        try {
            fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (rmError) {
            console.error("Error removing temp directory:", rmError);
        }
    }
}