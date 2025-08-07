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
    docker = new Docker()
  }
  return docker
}

// Interface for test case execution result
interface TestCaseResult {
  input: string
  expectedOutput: string
  actualOutput: string
  passed: boolean
  runtime: number
  memory: number
  error?: string
  errorType?: string
}

// Interface for code execution result
interface CodeExecutionResult {
  success: boolean
  testResults: TestCaseResult[]
  allPassed: boolean
  avgRuntime: number
  maxMemory: number
  errorMessage?: string
  compilationError?: string
}

// Normalize outputs to make comparison robust against whitespace around delimiters
function normalizeOutputForComparison(value: string): string {
  const normalizedNewlines = value.replace(/\r\n/g, "\n").trim()
  const normalizedDelimiters = normalizedNewlines
    .replace(/\s*,\s*/g, ",")
    .replace(/\s*;\s*/g, ";")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*\[\s*/g, "[")
    .replace(/\s*\]\s*/g, "]")
    .replace(/\s*\(\s*/g, "(")
    .replace(/\s*\)\s*/g, ")")
    .replace(/\s*\{\s*/g, "{")
    .replace(/\s*\}\s*/g, "}")
  // Collapse multiple spaces/newlines into a single space, without removing all spaces
  return normalizedDelimiters.replace(/\s+/g, " ").trim()
}

function areOutputsEquivalent(expected: string, actual: string): boolean {
  if (expected.trim() === actual.trim()) return true
  const normExpected = normalizeOutputForComparison(expected)
  const normActual = normalizeOutputForComparison(actual)
  return normExpected === normActual
}

// Main execution function that handles both single test case runs and full submissions
export async function executeCode(
  code: string,
  language: string,
  testCases: Array<{ input: string; output: string; id: string }>,
  timeLimit: number,
  memoryLimit: number,
  isSubmission: boolean = false
): Promise<CodeExecutionResult> {
  const executionId = randomUUID()
  const tempDir = path.join(process.cwd(), "tmp", executionId)
  
  try {
    // Create temp directory for code execution
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // For non-submission runs, only execute the first test case
    const casesToExecute = isSubmission ? testCases : testCases.slice(0, 1)
    const testResults: TestCaseResult[] = []
    let allPassed = true
    let totalRuntime = 0
    let maxMemory = 0
    let compilationError: string | undefined

    // Setup language-specific environment
    const langConfig = await setupLanguageEnvironment(code, language, tempDir)
    if (!langConfig.success) {
      return {
        success: false,
        testResults: [],
        allPassed: false,
        avgRuntime: 0,
        maxMemory: 0,
        compilationError: langConfig.error
      }
    }

    // Execute each test case
    for (const testCase of casesToExecute) {
      try {
        const result = await executeTestCase(
          langConfig,
          testCase.input,
          testCase.output,
          timeLimit,
          memoryLimit,
          tempDir
        )

        testResults.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: result.output,
          passed: result.passed,
          runtime: result.runtime,
          memory: result.memory,
          error: result.error,
          errorType: result.errorType
        })

        totalRuntime += result.runtime
        maxMemory = Math.max(maxMemory, result.memory)

        if (!result.passed) {
          allPassed = false
        }
      } catch (error) {
        console.error("Test case execution error:", error)
        testResults.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: "",
          passed: false,
          runtime: 0,
          memory: 0,
          error: String(error),
          errorType: "EXECUTION_ERROR"
        })
        allPassed = false
      }
    }

    return {
      success: true,
      testResults,
      allPassed,
      avgRuntime: casesToExecute.length > 0 ? Math.round(totalRuntime / casesToExecute.length) : 0,
      maxMemory,
      compilationError
    }

  } catch (error) {
    console.error("Code execution error:", error)
    return {
      success: false,
      testResults: [],
      allPassed: false,
      avgRuntime: 0,
      maxMemory: 0,
      errorMessage: String(error)
    }
  } finally {
    // Clean up temp files
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true })
      }
    } catch (rmError) {
      console.error("Error removing temp directory:", rmError)
    }
  }
}

// Language configuration interface
interface LanguageConfig {
  success: boolean
  runtimeImage: string
  execCommand: string[]
  error?: string
}

// Setup language-specific environment and files
async function setupLanguageEnvironment(
  code: string,
  language: string,
  tempDir: string
): Promise<LanguageConfig> {
  try {
    switch (language.toLowerCase()) {
      case "javascript":
        return await setupJavaScript(code, tempDir)
      case "python":
        return await setupPython(code, tempDir)
      case "java":
        return await setupJava(code, tempDir)
      case "c++":
      case "cpp":
        return await setupCpp(code, tempDir)
      case "c":
        return await setupC(code, tempDir)
      default:
        return {
          success: false,
          runtimeImage: "",
          execCommand: [],
          error: `Unsupported language: ${language}`
        }
    }
  } catch (error) {
    return {
      success: false,
      runtimeImage: "",
      execCommand: [],
      error: `Failed to setup ${language} environment: ${String(error)}`
    }
  }
}

// JavaScript setup
async function setupJavaScript(code: string, tempDir: string): Promise<LanguageConfig> {
  const solutionFile = path.join(tempDir, "solution.js")
  await writeFile(solutionFile, code)

  const runnerFile = path.join(tempDir, "runner.js")
  await writeFile(runnerFile, `
const fs = require('fs');

try {
  const input = fs.readFileSync('/app/input.txt', 'utf8').trim();
  
  // Try to execute the solution
  try {
    // Redirect stdin for the solution
    process.stdin.push(input);
    process.stdin.push(null);
    
    // Capture stdout
    let output = '';
    const originalWrite = process.stdout.write;
    process.stdout.write = function(string) {
      output += string;
      return true;
    };
    
    // Execute the solution
    require('/app/solution.js');
    
    // Restore stdout
    process.stdout.write = originalWrite;
    
    // If no output captured, try module export approach
    if (!output.trim()) {
      const solution = require('/app/solution.js');
      if (typeof solution === 'function') {
        output = solution(input);
      } else if (solution && typeof solution.solve === 'function') {
        output = solution.solve(input);
      } else if (solution && typeof solution.main === 'function') {
        output = solution.main(input);
      }
    }
    
    fs.writeFileSync('/app/output.txt', String(output || '').trim());
    
  } catch (execError) {
    // If solution execution fails, try eval approach
    try {
      const solutionCode = fs.readFileSync('/app/solution.js', 'utf8');
      
      // Create a context with console.log that captures output
      let output = '';
      const mockConsole = {
        log: (...args) => {
          output += args.join(' ') + '\\n';
        }
      };
      
      // Execute with mock console
      const func = new Function('console', 'input', solutionCode + '; return typeof solve !== "undefined" ? solve(input) : typeof main !== "undefined" ? main(input) : output;');
      const result = func(mockConsole, input);
      
      fs.writeFileSync('/app/output.txt', String(result || output).trim());
      
    } catch (evalError) {
      throw new Error('Failed to execute JavaScript solution: ' + evalError.message);
    }
  }
  
} catch (error) {
  fs.writeFileSync('/app/error.txt', 'Runtime Error: ' + error.message);
  process.exit(1);
}
`)

  return {
    success: true,
    runtimeImage: "node:18-alpine",
    execCommand: ["/bin/sh", "-c", "cd /app && node runner.js"]
  }
}

// Python setup
async function setupPython(code: string, tempDir: string): Promise<LanguageConfig> {
  const solutionFile = path.join(tempDir, "solution.py")
  await writeFile(solutionFile, code)

  const runnerFile = path.join(tempDir, "runner.py")
  await writeFile(runnerFile, `
import sys
import subprocess
import traceback
import importlib.util
import inspect
import io
import contextlib

try:
    with open('/app/input.txt', 'r') as f:
        input_data = f.read().strip()
    
    result = None
    has_functions = False
    
    try:
        spec = importlib.util.spec_from_file_location("solution", "/app/solution.py")
        solution = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(solution)
        
        # Check if module has callable functions
        if hasattr(solution, 'main') and callable(solution.main):
            result = solution.main(input_data)
            has_functions = True
        elif hasattr(solution, 'solve') and callable(solution.solve):
            result = solution.solve(input_data)
            has_functions = True
        else:
            functions = inspect.getmembers(solution, inspect.isfunction)
            if functions:
                result = functions[0][1](input_data)
                has_functions = True
    except Exception as import_error:
        # Module might be a direct script, not importable
        has_functions = False
    
    # If no functions found, execute as direct script
    if not has_functions:
        try:
            # Capture stdout from direct execution
            old_stdin = sys.stdin
            sys.stdin = io.StringIO(input_data)
            
            captured_output = io.StringIO()
            with contextlib.redirect_stdout(captured_output):
                with open('/app/solution.py', 'r') as f:
                    code_content = f.read()
                exec(code_content)
            
            sys.stdin = old_stdin
            result = captured_output.getvalue().strip()
            
            # If no output captured, try subprocess execution
            if not result:
                process = subprocess.run(['python', '/app/solution.py'], 
                                       input=input_data, 
                                       text=True, 
                                       capture_output=True, 
                                       timeout=30)
                if process.returncode == 0:
                    result = process.stdout.strip()
                else:
                    raise Exception(f"Script execution failed: {process.stderr}")
                    
        except Exception as exec_error:
            raise Exception(f"Failed to execute Python code: {str(exec_error)}")
    
    with open('/app/output.txt', 'w') as f:
        f.write(str(result or '').strip())
        
except Exception as e:
    with open('/app/error.txt', 'w') as f:
        f.write(f"Runtime Error: {str(e)}")
    sys.exit(1)
`)

  return {
    success: true,
    runtimeImage: "python:3.11-alpine",
    execCommand: ["python", "/app/runner.py"]
  }
}

// Java setup
async function setupJava(code: string, tempDir: string): Promise<LanguageConfig> {
  // Extract class name from the code
  const classMatch = code.match(/public\s+class\s+(\w+)/);
  const className = classMatch ? classMatch[1] : "Solution";
  
  // Create the solution file with the correct class name
  const solutionFile = path.join(tempDir, `${className}.java`)
  await writeFile(solutionFile, code)

  const runnerFile = path.join(tempDir, "Runner.java")
  await writeFile(runnerFile, `
import java.io.*;
import java.nio.file.*;
import java.lang.reflect.Method;

public class Runner {
    public static void main(String[] args) {
        try {
            String input = new String(Files.readAllBytes(Paths.get("/app/input.txt"))).trim();
            
            // Redirect System.in for the solution
            System.setIn(new ByteArrayInputStream(input.getBytes()));
            
            // Capture System.out
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PrintStream originalOut = System.out;
            System.setOut(new PrintStream(baos));
            
            // Dynamically invoke the main method of the solution class
            try {
                Class<?> solutionClass = Class.forName("${className}");
                Method mainMethod = solutionClass.getMethod("main", String[].class);
                System.err.println("Invoking main method of class: ${className}");
                mainMethod.invoke(null, (Object) new String[]{});
            } catch (ClassNotFoundException e) {
                System.err.println("Class ${className} not found, trying Solution class");
                try {
                    Class<?> solutionClass = Class.forName("Solution");
                    Method mainMethod = solutionClass.getMethod("main", String[].class);
                    System.err.println("Invoking main method of class: Solution");
                    mainMethod.invoke(null, (Object) new String[]{});
                } catch (Exception fallbackError) {
                    System.err.println("Failed to invoke Solution class: " + fallbackError.getMessage());
                    throw fallbackError;
                }
            }
            
            // Restore System.out
            System.setOut(originalOut);
            
            // Write captured output to file
            String output = baos.toString().trim();
            Files.write(Paths.get("/app/output.txt"), output.getBytes());
            
        } catch (Exception e) {
            try {
                Files.write(Paths.get("/app/error.txt"), ("Runtime Error: " + e.getMessage()).getBytes());
            } catch (IOException ignored) {}
            System.exit(1);
        }
    }
}
`)

  return {
    success: true,
    runtimeImage: "openjdk:17-slim",
    execCommand: [
      "/bin/sh", "-c", 
      "cd /app && javac *.java 2>/app/compile_error.txt && if [ $? -eq 0 ]; then java Runner 2>/app/runtime_error.txt; else cat /app/compile_error.txt > /app/error.txt && exit 1; fi || cat /app/runtime_error.txt > /app/error.txt"
    ]
  }
}

// C++ setup
async function setupCpp(code: string, tempDir: string): Promise<LanguageConfig> {
  const solutionFile = path.join(tempDir, "solution.cpp")
  await writeFile(solutionFile, code)

  const runnerFile = path.join(tempDir, "runner.cpp")
  await writeFile(runnerFile, `
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <stdexcept>

std::string runSolution(const std::string& input);

int main() {
    try {
        std::ifstream inFile("/app/input.txt");
        std::stringstream buffer;
        buffer << inFile.rdbuf();
        std::string input = buffer.str();
        inFile.close();
        
        std::string output = runSolution(input);
        
        std::ofstream outFile("/app/output.txt");
        outFile << output;
        outFile.close();
        
        return 0;
    } catch (const std::exception& e) {
        std::ofstream errorFile("/app/error.txt");
        errorFile << "Runtime Error: " << e.what();
        errorFile.close();
        return 1;
    }
}
`)

  const wrapperFile = path.join(tempDir, "solution_wrapper.cpp")
  await writeFile(wrapperFile, `
#include <sstream>
#include <iostream>
#include <streambuf>

#define main user_main
#include "solution.cpp"
#undef main

std::string runSolution(const std::string& input) {
    std::stringstream inputStream(input);
    std::streambuf* oldCin = std::cin.rdbuf(inputStream.rdbuf());
    
    std::stringstream outputStream;
    std::streambuf* oldCout = std::cout.rdbuf(outputStream.rdbuf());
    
    user_main();
    
    std::cin.rdbuf(oldCin);
    std::cout.rdbuf(oldCout);
    
    return outputStream.str();
}
`)

  return {
    success: true,
    runtimeImage: "gcc:latest",
    execCommand: [
      "/bin/sh", "-c",
      "cd /app && g++ -o runner runner.cpp solution_wrapper.cpp -std=c++17 2>/app/compile_error.txt && ./runner || (cat /app/compile_error.txt > /app/error.txt && exit 1)"
    ]
  }
}

// C setup
async function setupC(code: string, tempDir: string): Promise<LanguageConfig> {
  const solutionFile = path.join(tempDir, "solution.c")
  await writeFile(solutionFile, code)

  const runnerFile = path.join(tempDir, "runner.c")
  await writeFile(runnerFile, `
#include <stdio.h>
#include <stdlib.h>

extern int main();

int main_wrapper() {
    freopen("/app/input.txt", "r", stdin);
    freopen("/app/output.txt", "w", stdout);
    freopen("/app/error.txt", "w", stderr);
    
    return main();
}
`)

  return {
    success: true,
    runtimeImage: "gcc:latest",
    execCommand: [
      "/bin/sh", "-c",
      "cd /app && gcc -o runner runner.c solution.c -std=c11 2>/app/compile_error.txt && ./runner || (cat /app/compile_error.txt > /app/error.txt && exit 1)"
    ]
  }
}

// Execute a single test case
async function executeTestCase(
  langConfig: LanguageConfig,
  input: string,
  expectedOutput: string,
  timeLimit: number,
  memoryLimit: number,
  tempDir: string
): Promise<{
  output: string
  passed: boolean
  runtime: number
  memory: number
  error?: string
  errorType?: string
}> {
  // Write input to file
  await writeFile(path.join(tempDir, "input.txt"), input)

  const docker = getDockerInstance()
  let container: Docker.Container | null = null

  try {
    container = await docker.createContainer({
      Image: langConfig.runtimeImage,
      Cmd: langConfig.execCommand,
      HostConfig: {
        Binds: [`${tempDir}:/app`],
        Memory: memoryLimit * 1024 * 1024, // Convert MB to bytes
        MemorySwap: memoryLimit * 1024 * 1024,
        NanoCpus: 1000000000, // 1 CPU
        PidsLimit: 50,
        ReadonlyRootfs: false,
        NetworkMode: "none",
      },
      Tty: false,
      OpenStdin: false,
    })

    // Start execution timer - this is when we start measuring runtime
    const startTime = process.hrtime.bigint()
    
    await container.start()

    // Wait for container with timeout
    const executionPromise = new Promise<any>((resolve, reject) => {
      container!.wait((err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("TIME_LIMIT_EXCEEDED"))
      }, timeLimit * 1000)
    })

    let result: any
    let timedOut = false

    try {
      result = await Promise.race([executionPromise, timeoutPromise])
    } catch (error) {
      if (String(error).includes("TIME_LIMIT_EXCEEDED")) {
        timedOut = true
        try {
          await container.kill()
        } catch (killError) {
          console.error("Error killing container:", killError)
        }
      }
      throw error
    }

    // Stop execution timer - this is when we stop measuring runtime
    const endTime = process.hrtime.bigint()
    const runtime = Number(endTime - startTime) / 1000000 // Convert nanoseconds to milliseconds

    // Get memory stats
    const stats = await container.stats({ stream: false })
    const memoryUsage = stats.memory_stats.usage ? Math.round(stats.memory_stats.usage / 1024) : 0 // Convert to KB

    let output = ""
    let error = ""
    let errorType = ""

    if (timedOut) {
      errorType = "TIME_LIMIT_EXCEEDED"
      error = "Time limit exceeded"
    } else {
      // Check for error file first
      if (fs.existsSync(path.join(tempDir, "error.txt"))) {
        error = fs.readFileSync(path.join(tempDir, "error.txt"), "utf8").trim()
        if (error.includes("Compilation Error")) {
          errorType = "COMPILATION_ERROR"
        } else if (error.includes("Runtime Error")) {
          errorType = "RUNTIME_ERROR"
        } else {
          errorType = "EXECUTION_ERROR"
        }
      } else if (fs.existsSync(path.join(tempDir, "output.txt"))) {
        output = fs.readFileSync(path.join(tempDir, "output.txt"), "utf8").trim()
      } else {
        // No output file was generated
        error = "No output file generated"
        errorType = "EXECUTION_ERROR"
      }

      // Check memory limit
      if (memoryUsage >= memoryLimit * 1024) {
        errorType = "MEMORY_LIMIT_EXCEEDED"
        error = "Memory limit exceeded"
      }
    }

    // Clean up container
    try {
      await container.remove({ force: true })
    } catch (removeError) {
      console.error("Error removing container:", removeError)
    }

    const passed = !error && !errorType && areOutputsEquivalent(expectedOutput, output)

    return {
      output: error || output,
      passed,
      runtime: Math.round(runtime),
      memory: memoryUsage,
      error: error || undefined,
      errorType: errorType || undefined
    }

  } catch (error) {
    if (container) {
      try {
        await container.remove({ force: true })
      } catch (removeError) {
        console.error("Error removing container:", removeError)
      }
    }
    throw error
  }
}

// Legacy function for backward compatibility
export async function executeCodeInDocker(
  code: string,
  language: string,
  input: string,
  expectedOutput: string,
  timeLimit: number,
  memoryLimit: number,
) {
  const testCases = [{ input, output: expectedOutput, id: "single" }]
  const result = await executeCode(code, language, testCases, timeLimit, memoryLimit, false)
  
  if (result.testResults.length > 0) {
    const testResult = result.testResults[0]
    return {
      passed: testResult.passed,
      output: testResult.actualOutput,
      error: testResult.errorType,
      runtime: testResult.runtime,
      memory: testResult.memory,
      showError: !!testResult.error,
      errorType: testResult.errorType,
      isCompilationError: testResult.errorType === "COMPILATION_ERROR",
      formattedError: testResult.error
    }
  }
  
  return {
    passed: false,
    output: "",
    error: result.errorMessage || "Execution failed",
    runtime: 0,
    memory: 0,
    showError: true,
    errorType: "EXECUTION_ERROR",
    isCompilationError: false,
    formattedError: result.errorMessage || "Execution failed"
  }
}