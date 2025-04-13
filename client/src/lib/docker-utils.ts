import Docker from "dockerode"
import * as fs from "fs"
import path from "path"
import { writeFile } from "fs/promises"
import { randomUUID } from "crypto"

// Initialize Docker outside API handler to prevent re-initialization on each request
let docker: Docker | null = null

// Function to get Docker instance with lazy initialization
export function getDockerInstance(): Docker {
  if (!docker) {
    // When running in a production environment, we should use the Docker socket
    docker = new Docker()
  }
  return docker
}

// Simplified code execution function with plain text input/output
export async function executeCodeInDocker(
  code: string,
  language: string,
  input: string,
  expectedOutput: string,
  timeLimit: number,
  memoryLimit: number,
) {
  const executionId = randomUUID()

  // Create temp directory for code execution
  const tempDir = path.join(process.cwd(), "tmp", executionId)
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  let mainFile, runtimeImage, execCommand

  // Language-specific setups
  switch (language.toLowerCase()) {
    case "javascript":
      mainFile = path.join(tempDir, "solution.js")
      await writeFile(mainFile, code)

      // Create a simplified runner file
      const jsRunnerFile = path.join(tempDir, "runner.js")
      await writeFile(
        jsRunnerFile,
        `
const fs = require('fs');
const solution = require('./solution.js');

const input = fs.readFileSync('/app/input.txt', 'utf8');
let output;

// Check if solution exports a function directly
if (typeof solution === 'function') {
    output = solution(input);
} 
// Check if solution has a main or solve function
else if (typeof solution.main === 'function') {
    output = solution.main(input);
} 
else if (typeof solution.solve === 'function') {
    output = solution.solve(input);
} 
// Try to find any exported function
else {
    const exportedFunctions = Object.keys(solution).filter(key => typeof solution[key] === 'function');
    if (exportedFunctions.length > 0) {
        output = solution[exportedFunctions[0]](input);
    } else {
        output = "Error: No executable function found in solution";
    }
}

fs.writeFileSync('/app/output.txt', String(output));
`,
      )

      runtimeImage = "node:18-alpine"
      execCommand = ["node", "/app/runner.js"]
      break

    case "python":
      mainFile = path.join(tempDir, "solution.py")
      await writeFile(mainFile, code)

      // Create a simplified runner file
      const pyRunnerFile = path.join(tempDir, "runner.py")
      await writeFile(
        pyRunnerFile,
        `
import importlib.util
import sys
import inspect

# Load the solution module
spec = importlib.util.spec_from_file_location("solution", "/app/solution.py")
solution = importlib.util.module_from_spec(spec)
spec.loader.exec_module(solution)

# Read input
with open('/app/input.txt', 'r') as f:
    input_data = f.read()

# Find the main function to execute
result = None
if hasattr(solution, 'main') and callable(solution.main):
    result = solution.main(input_data)
elif hasattr(solution, 'solve') and callable(solution.solve):
    result = solution.solve(input_data)
else:
    # Find any function that could be the entry point
    functions = inspect.getmembers(solution, inspect.isfunction)
    if functions:
        result = functions[0][1](input_data)
    else:
        result = "Error: No executable function found in solution"

# Write output
with open('/app/output.txt', 'w') as f:
    f.write(str(result))
`,
      )

      runtimeImage = "python:3.11-alpine"
      execCommand = ["python", "/app/runner.py"]
      break

    case "java":
      mainFile = path.join(tempDir, "Solution.java")
      await writeFile(mainFile, code)

      // Create a simplified runner file
      await writeFile(
        path.join(tempDir, "Runner.java"),
        `import java.io.*;
import java.nio.file.*;
import java.lang.reflect.*;

public class Runner {
    public static void main(String[] args) {
        try {
            // Read input and write to System.in simulation file
            String input = new String(Files.readAllBytes(Paths.get("/app/input.txt")));
            Files.write(Paths.get("/app/system_in.txt"), input.getBytes());
            
            // Redirect System.in to read from our file
            System.setIn(new FileInputStream("/app/system_in.txt"));
            
            // Compile Solution
            Process compile = Runtime.getRuntime().exec("javac /app/Solution.java");
            compile.waitFor();
            
            if (compile.exitValue() != 0) {
                writeOutput("Compilation Error");
                return;
            }
            
            // Redirect output capture
            PrintStream originalOut = System.out;
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            System.setOut(new PrintStream(baos));
            
            // Execute Solution
            Class<?> solutionClass = Class.forName("Solution");
            Method mainMethod = solutionClass.getMethod("main", String[].class);
            mainMethod.invoke(null, (Object) new String[0]);
            
            // Restore output and write results
            System.setOut(originalOut);
            writeOutput(baos.toString());
            
        } catch (Exception e) {
            writeOutput("Execution Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private static void writeOutput(String content) {
        try (FileWriter writer = new FileWriter("/app/output.txt")) {
            writer.write(content);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}`
      )

      runtimeImage = "openjdk:17-slim"
      execCommand = [
        "/bin/sh", 
        "-c", 
        "cd /app && " +
        "javac Runner.java && " +
        "java -Xmx" + Math.floor(memoryLimit * 0.9) + "M Runner"
      ]
      break

    default:
      throw new Error(`Unsupported language: ${language}`)
  }

  // Write input to file
  await writeFile(path.join(tempDir, "input.txt"), input)
  
  // Create empty system_in.txt for Java
  if (language.toLowerCase() === "java") {
    await writeFile(path.join(tempDir, "system_in.txt"), "")
  }

  try {
    const docker = getDockerInstance()
    
    const container = await docker.createContainer({
      Image: runtimeImage,
      Cmd: execCommand,
      HostConfig: {
        Binds: [`${tempDir}:/app`],
        Memory: memoryLimit * 1024 * 1024,
        MemorySwap: memoryLimit * 1024 * 1024,
        NanoCpus: 1000000000,
        PidsLimit: 50,
        ReadonlyRootfs: false, // Changed to false for Java to allow temp files
        NetworkMode: "none",
      },
      Tty: false,
      OpenStdin: false,
      StopTimeout: timeLimit,
    })

    // Start execution timer
    const startTime = Date.now()

    // Start container
    await container.start()

    // Wait for container to finish or timeout
    const executionPromise = new Promise((resolve, reject) => {
      container.wait((err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })

    let executionResult: any
    let timedOut = false

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          timedOut = true
          reject(new Error("TIME_LIMIT_EXCEEDED"))
        }, timeLimit * 1000) // Convert to milliseconds
      })

      executionResult = await Promise.race([executionPromise, timeoutPromise])
    } catch (error) {
      if (timedOut) {
        try {
          await container.stop()
        } catch (stopError) {
          console.error("Error stopping container:", stopError)
        }
        executionResult = { StatusCode: 124, Error: "TIME_LIMIT_EXCEEDED" }
      } else {
        throw error
      }
    }

    // Calculate runtime
    const runtime = Date.now() - startTime

    // Get container stats for memory usage
    const stats = await container.stats({ stream: false })
    const memoryUsage = stats.memory_stats.usage / 1024 // Convert bytes to KB

    let output = ""
    let error = ""
    let status = ""

    if (!timedOut) {
      // Read execution output
      if (fs.existsSync(path.join(tempDir, "output.txt"))) {
        output = fs.readFileSync(path.join(tempDir, "output.txt"), "utf8").trim()
      }

      // Get logs for error messages
      const logs = await container.logs({
        stdout: true,
        stderr: true,
      })
      error = logs.toString("utf8")

      // Check execution status
      if (executionResult && executionResult.StatusCode !== 0) {
        if (error.includes("OutOfMemoryError") || memoryUsage >= memoryLimit * 1024) {
          status = "MEMORY_LIMIT_EXCEEDED"
        } else {
          status = "RUNTIME_ERROR"
        }
      }
    } else {
      status = "TIME_LIMIT_EXCEEDED"
    }

    // Clean up container
    try {
      await container.remove({ force: true })
    } catch (removeError) {
      console.error("Error removing container:", removeError)
    }

    // Compare output with expected output
    const passed = output.trim() === expectedOutput.trim() && !status

    return {
      passed,
      output: output || error,
      error: status,
      runtime,
      memory: Math.round(memoryUsage),
    }
  } catch (error) {
    console.error("Docker execution error:", error)
    throw error
  } finally {
    // Clean up temp files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
    } catch (rmError) {
      console.error("Error removing temp directory:", rmError)
    }
  }
}