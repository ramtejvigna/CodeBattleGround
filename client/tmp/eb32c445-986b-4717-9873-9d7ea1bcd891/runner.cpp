
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
