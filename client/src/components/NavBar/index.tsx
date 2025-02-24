"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Grip } from 'lucide-react';
import GridModel from './GridModel';

const NavBar = () => {
    const [searchFocus, setSearchFocus] = useState(false);
    const [gridModel, setGridModel] = useState(false);

    return (
        <div className=''>
            <nav className="flex flex-row justify-between items-center p-4 px-8">
                {/* Logo Section */}
                <Link href="/" className="flex-shrink-0">
                    <h1 className="cursor-pointer uppercase font-[family-name:var(--font-kanit-sans)] flex flex-col select-none">
                        <span className="text-[9px] leading-[9px] self-start tracking-wider text-gray-400">Code</span>
                        <span className="bg-gradient-to-tr from-[#F14A00] to-[#C62300] text-2xl py-1 bg-clip-text text-transparent leading-[12px] font-extrabold tracking-wide scale-y-75 transform origin-top">
                            Battle
                        </span>
                        <span className="text-[9px] leading-[0] self-end tracking-wider text-gray-400">Ground</span>
                    </h1>
                </Link>

                {/* Search Bar Section */}
                <div className={`relative w-1/2 transition-all duration-300 ${searchFocus ? 'scale-100' : 'scale-95'}`}>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search battles, challenges, warriors..."
                            className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg py-2 pl-4 pr-10 text-gray-300 
                                     placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500
                                     transition-all duration-300"
                            onFocus={() => setSearchFocus(true)}
                            onBlur={() => setSearchFocus(false)}
                        />
                        <Search
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 
                                      ${searchFocus ? 'text-orange-500' : 'text-gray-500'} 
                                      transition-colors duration-300`}
                        />
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="text-gray-300 flex-shrink-0">
                    <ul className="flex flex-row items-center gap-8 text-sm">
                        <li>
                            <Link href="/about" className="relative group">
                                <span className="cursor-pointer transition-colors duration-300">
                                    About
                                </span>
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-tr from-[#F14A00] to-[#C62300] rounded-full group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/certifications" className="relative group">
                                <span className="cursor-pointer transition-colors duration-300">
                                    Certifications
                                </span>
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-tr from-[#F14A00] to-[#C62300] rounded-full group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        </li>
                        <li onClick={() => setGridModel(prev => !prev)}>
                            <span className="cursor-pointer transition-colors duration-300">
                                <Grip />
                            </span>
                        </li>

                        <span className='opacity-40'>|</span>

                        <li>
                            <Link href="/profile" className="relative group">
                                <span className="cursor-pointer transition-colors duration-300">
                                    Profile
                                </span>
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-tr from-[#F14A00] to-[#C62300] rounded-full group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        </li>
                    </ul>

                    
            {gridModel && <GridModel />}
                </div>
            </nav>
        </div>
    );
};

export default NavBar;