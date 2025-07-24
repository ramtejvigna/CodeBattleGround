
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
