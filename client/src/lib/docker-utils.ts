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

    case "c++":
    case "cpp":
      mainFile = path.join(tempDir, "solution.cpp")
      await writeFile(mainFile, code)

      // Create a C++ runner file that doesn't conflict with user's main
      await writeFile(
        path.join(tempDir, "runner.cpp"),
        `#include <iostream>
        #include <fstream>
        #include <sstream>
        #include <string>
        #include <stdexcept>
        
        // Forward declaration of user's solution function
        std::string runSolution(const std::string& input);
        
        int main() {
            try {
                // Read input
                std::ifstream inFile("/app/input.txt");
                if (!inFile.is_open()) {
                    throw std::runtime_error("Cannot open input file");
                }
                
                std::stringstream buffer;
                buffer << inFile.rdbuf();
                std::string input = buffer.str();
                inFile.close();
                
                // Run the solution
                std::string output = runSolution(input);
                
                // Write output
                std::ofstream outFile("/app/output.txt");
                if (!outFile.is_open()) {
                    throw std::runtime_error("Cannot open output file");
                }
                outFile << output;
                outFile.close();
                
                return 0;
            } catch (const std::exception& e) {
                std::ofstream errorFile("/app/output.txt");
                errorFile << "Runtime Error: " << e.what();
                errorFile.close();
                return 1;
            } catch (...) {
                std::ofstream errorFile("/app/output.txt");
                errorFile << "Runtime Error: Unknown exception occurred";
                errorFile.close();
                return 1;
            }
        }
        `
      )

      // Create a header file to connect the runner with the solution
      await writeFile(
        path.join(tempDir, "solution.h"),
        `#ifndef SOLUTION_H
        #define SOLUTION_H
        
        #include <string>
        
        std::string runSolution(const std::string& input);
        
        #endif
        `
      )

      // Create a wrapper file that includes the user's solution
      await writeFile(
        path.join(tempDir, "solution_wrapper.cpp"),
        `#include "solution.h"
        #include <sstream>
        #include <iostream>
        #include <streambuf>
        #include <stdexcept>
        
        // Rename user's main to avoid conflict
        #define main user_main
        #include "solution.cpp"
        #undef main
        
        std::string runSolution(const std::string& input) {
            try {
                // Redirect cin/cout to capture the output
                std::stringstream inputStream(input);
                std::streambuf* oldCin = std::cin.rdbuf(inputStream.rdbuf());
                
                std::stringstream outputStream;
                std::streambuf* oldCout = std::cout.rdbuf(outputStream.rdbuf());
                
                // Call the renamed user main with exception handling
                int result = user_main();
                
                // Restore cin/cout
                std::cin.rdbuf(oldCin);
                std::cout.rdbuf(oldCout);
                
                return outputStream.str();
            } catch (const std::exception& e) {
                return "Runtime Error: " + std::string(e.what());
            } catch (...) {
                return "Runtime Error: Unknown exception occurred";
            }
        }
        `
      )

      // Update the Makefile
      await writeFile(
        path.join(tempDir, "Makefile"),
        'all:\n\tg++ -o runner runner.cpp solution_wrapper.cpp -std=c++17 -I/app\n\nclean:\n\trm -f runner'
      )

      runtimeImage = "gcc:latest"
      execCommand = [
        "/bin/sh",
        "-c",
        "cd /app && make && ./runner"
      ]
      break

    case "c":
      mainFile = path.join(tempDir, "solution.c")
      await writeFile(mainFile, code)

      // Create a C runner file
      await writeFile(
        path.join(tempDir, "runner.c"),
        `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Forward declaration of user's code
extern int main();

// Function to redirect stdin/stdout and capture output
void execute_and_capture() {
    // Redirect stdin to our input file
    FILE* input = freopen("/app/input.txt", "r", stdin);
    if (!input) {
        fprintf(stderr, "Error opening input file\\n");
        return;
    }
    
    // Redirect stdout to our output file
    FILE* output = freopen("/app/output.txt", "w", stdout);
    if (!output) {
        fprintf(stderr, "Error opening output file\\n");
        fclose(input);
        return;
    }
    
    // Run user's main
    main();
    
    // Close redirected files
    fclose(input);
    fclose(output);
}

int main(int argc, char* argv[]) {
    execute_and_capture();
    return 0;
}
`
      )

      // Create a simple Makefile for C
      await writeFile(
        path.join(tempDir, "Makefile"),
        `all:
	gcc -o runner runner.c solution.c -std=c11

clean:
	rm -f runner
`
      )

      runtimeImage = "gcc:latest"
      execCommand = [
        "/bin/sh",
        "-c",
        "cd /app && make && ./runner"
      ]
      break

    case "ruby":
      mainFile = path.join(tempDir, "solution.rb")
      await writeFile(mainFile, code)

      // Create a Ruby runner file
      await writeFile(
        path.join(tempDir, "runner.rb"),
        `#!/usr/bin/env ruby
require_relative './solution'

# Redirect stdin to input file
$stdin = File.open('/app/input.txt', 'r')

# Capture stdout
original_stdout = $stdout
$stdout = StringIO.new

# Run the solution based on what's available
if defined?(solve)
  output = solve($stdin.read)
  $stdout.puts(output) if output
elsif defined?(main)
  output = main($stdin.read)
  $stdout.puts(output) if output
elsif defined?(solution)
  output = solution($stdin.read)
  $stdout.puts(output) if output
else
  # Try to find a method that could be called
  Object.methods.each do |method|
    if method.to_s =~ /^(solve|main|solution|process)/
      output = send(method, $stdin.read)
      $stdout.puts(output) if output
      break
    end
  end
end

# Get captured output and write to file
captured_output = $stdout.string
$stdout = original_stdout
File.write('/app/output.txt', captured_output)
`
      )

      runtimeImage = "ruby:3-alpine"
      execCommand = ["ruby", "/app/runner.rb"]
      break

    case "go":
      mainFile = path.join(tempDir, "solution.go")
      await writeFile(mainFile, code)

      // Create a Go runner file
      await writeFile(
        path.join(tempDir, "runner.go"),
        `package main

import (
	"io/ioutil"
	"os"
)

// Import user's solution
// The solution.go file should have package main

func main() {
	// Read input
	input, err := ioutil.ReadFile("/app/input.txt")
	if err != nil {
		panic(err)
	}

	// Redirect stdin to read from input
	oldStdin := os.Stdin
	tmpFile, err := ioutil.TempFile("", "stdin")
	if err != nil {
		panic(err)
	}
	defer os.Remove(tmpFile.Name())
	
	_, err = tmpFile.Write(input)
	if err != nil {
		panic(err)
	}
	tmpFile.Seek(0, 0)
	os.Stdin = tmpFile
	
	// Redirect stdout to capture output
	oldStdout := os.Stdout
	r, w, _ := os.Pipe()
	os.Stdout = w
	
	// Run the user's main function
	main()
	
	// Restore stdin/stdout
	os.Stdin = oldStdin
	w.Close()
	os.Stdout = oldStdout
	
	// Read captured output
	capturedOutput, _ := ioutil.ReadAll(r)
	
	// Write to output file
	ioutil.WriteFile("/app/output.txt", capturedOutput, 0644)
}`
      )

      runtimeImage = "golang:1.18-alpine"
      execCommand = [
        "/bin/sh",
        "-c",
        "cd /app && go build -o runner *.go && ./runner"
      ]
      break

    case "rust":
      mainFile = path.join(tempDir, "solution.rs")
      await writeFile(mainFile, code)

      // Create a Cargo.toml file
      await writeFile(
        path.join(tempDir, "Cargo.toml"),
        `[package]
name = "solution"
version = "0.1.0"
edition = "2021"

[dependencies]
`
      )

      // Create a main.rs file to import and run the solution
      await writeFile(
        path.join(tempDir, "main.rs"),
        `use std::fs::{self, File};
use std::io::{self, Read, Write};

// Include user's solution code
include!("solution.rs");

fn main() -> io::Result<()> {
    // Read input
    let mut input = String::new();
    File::open("/app/input.txt")?.read_to_string(&mut input)?;
    
    // Capture output
    let output = if let Some(main_fn) = option_env!("MAIN_FN") {
        match main_fn {
            "main" => main(&input),
            "solve" => solve(&input),
            "solution" => solution(&input),
            _ => String::from("Error: Function not found"),
        }
    } else {
        // Try common function names
        match () {
            _ if is_defined!("main") => main(&input),
            _ if is_defined!("solve") => solve(&input),
            _ if is_defined!("solution") => solution(&input),
            _ => String::from("Error: No callable function found"),
        }
    };
    
    // Write output
    fs::write("/app/output.txt", output)?;
    Ok(())
}

// Macro to check if function is defined (simplified)
macro_rules! is_defined {
    ($name:expr) => {
        false // This is a placeholder, Rust doesn't have easy runtime reflection
    };
}
`
      )

      runtimeImage = "rust:1.59-alpine"
      execCommand = [
        "/bin/sh",
        "-c",
        "cd /app && rustc -o runner main.rs && ./runner"
      ]
      break

    case "php":
      mainFile = path.join(tempDir, "solution.php")
      await writeFile(mainFile, code)

      // Create a PHP runner file
      await writeFile(
        path.join(tempDir, "runner.php"),
        `<?php
// Include user's solution
require_once('./solution.php');

// Read input
$input = file_get_contents('/app/input.txt');

// Capture output
ob_start();

// Try to call the appropriate function
if (function_exists('main')) {
    $result = main($input);
    if ($result !== null) echo $result;
} elseif (function_exists('solve')) {
    $result = solve($input);
    if ($result !== null) echo $result;
} elseif (function_exists('solution')) {
    $result = solution($input);
    if ($result !== null) echo $result;
} else {
    // Try to find any function that might be the entry point
    $functions = get_defined_functions()['user'];
    if (!empty($functions)) {
        $func = $functions[0];
        $result = $func($input);
        if ($result !== null) echo $result;
    } else {
        echo "Error: No callable function found";
    }
}

// Get captured output
$output = ob_get_clean();

// Write to output file
file_put_contents('/app/output.txt', $output);
`
      )

      runtimeImage = "php:8.1-alpine"
      execCommand = ["php", "/app/runner.php"]
      break

    default:
      throw new Error(`Unsupported language: ${language}`)
  }

  // Add this function to format compilation errors
  function formatCompilationError(logOutput: string): string {
    const lines = logOutput.split('\n');
    let formattedError = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip make and g++ command lines
      if (line.startsWith('@g++') || line.startsWith('make:') || line.startsWith('In file included')) {
        continue;
      }

      // Format error lines
      if (line.includes('error:')) {
        const parts = line.split(':');
        if (parts.length >= 4) {
          const file = parts[0].replace(/^.*\//, ''); // Remove path, keep filename
          const lineNum = parts[1];
          const colNum = parts[2];
          const errorMsg = parts.slice(3).join(':').trim();

          formattedError += `${file}:${lineNum}:${colNum}: ${errorMsg}\n`;

          // Look for the code line that follows
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1].trim();
            if (nextLine.includes('|')) {
              const codeParts = nextLine.split('|');
              if (codeParts.length >= 2) {
                const lineNumber = codeParts[0].trim();
                const code = codeParts[1];
                formattedError += `${lineNumber} |${code}\n`;

                // Look for the pointer line
                if (i + 2 < lines.length) {
                  const pointerLine = lines[i + 2].trim();
                  if (pointerLine.includes('^')) {
                    const pointerParts = pointerLine.split('|');
                    if (pointerParts.length >= 2) {
                      formattedError += `     |${pointerParts[1]}\n`;
                    }
                  }
                }
              }
            }
          }
          formattedError += '\n';
        }
      }
    }

    return formattedError.trim() || logOutput;
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
    let compilationError = ""

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
      const logOutput = logs.toString("utf8")

      // Check for compilation errors specifically
      if (logOutput.includes("error:") || logOutput.includes("Error:") || logOutput.includes("ERROR:")) {
        // For C++
        if (language.toLowerCase() === "c++" || language.toLowerCase() === "cpp") {
          if (logOutput.includes("solution_wrapper.cpp:") ||
            logOutput.includes("runner.cpp:") ||
            logOutput.includes("solution.cpp:") ||
            logOutput.includes("make: *** [Makefile")) {
            compilationError = formatCompilationError(logOutput)
            status = "COMPILATION_ERROR"
          }
        }
        // For Java
        else if (language.toLowerCase() === "java") {
          if (logOutput.includes("Compilation Error") || logOutput.includes("javac")) {
            // Format Java compilation errors
            const javaError = logOutput
              .split('\n')
              .filter(line => line.includes('error:') || line.includes('^'))
              .join('\n')
            compilationError = javaError || logOutput
            status = "COMPILATION_ERROR"
          }
        }
        // For other languages - add similar formatting as needed
        else {
          compilationError = logOutput
          status = "COMPILATION_ERROR"
        }
      }

      // Check for runtime errors in output
      if (output.includes("Runtime Error:")) {
        error = output
        status = "RUNTIME_ERROR"
        output = "" // Clear output since it contains error
      }

      // Check execution status
      if (executionResult && executionResult.StatusCode !== 0 && !status) {
        if (logOutput.includes("OutOfMemoryError") || memoryUsage >= memoryLimit * 1024) {
          status = "MEMORY_LIMIT_EXCEEDED"
        } else {
          status = "RUNTIME_ERROR"
          error = logOutput
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

    // Return structure that shows formatted errors
    return {
      passed,
      output: passed ? output : (compilationError || error || output),
      error: status,
      runtime,
      memory: Math.round(memoryUsage),
      showError: !!status,
      errorType: status,
      isCompilationError: status === "COMPILATION_ERROR",
      formattedError: compilationError || error
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