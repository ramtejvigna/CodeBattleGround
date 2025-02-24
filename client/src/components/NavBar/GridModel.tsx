import React from 'react';
import Link from 'next/link';
import { Swords, SquareKanban, Trophy, Code, Users, BookOpen } from 'lucide-react';

const gridData = [
    {
        title: "Contests",
        icon: <Swords className="w-6 h-6" />,
        link: "/contests",
    },
    {
        title: "LeaderBoard",
        icon: <Trophy className="w-6 h-6" />,
        link: "/leaderboard"
    },
    {
        title: "Challenges",
        icon: <Code className="w-6 h-6" />,
        link: "/challenges"
    },
    {
        title: "Community",
        icon: <Users className="w-6 h-6" />,
        link: "/community"
    },
    {
        title: "Learning",
        icon: <BookOpen className="w-6 h-6" />,
        link: "/learning"
    },
    {
        title: "Awards",
        icon: <SquareKanban className="w-6 h-6" />,
        link: "/awards"
    }
];

const GridModel = () => {
    return (
        <div className="absolute right-20 rounded-xl p-8 border border-orange-500 border-dotted mt-4 shadow-xl">
            <div className="grid grid-cols-3 gap-8">
                {gridData.map((data, index) => (
                    <div key={index} className="relative group">
                        {/* We'll use a before pseudo-element with border gradients for each side */}
                        <Link 
                            href={data.link} 
                            className="relative w-24 h-24 flex flex-col items-center justify-center rounded-lg transition-all duration-300 overflow-hidden"
                        >
                            {/* Pseudo-elements for the animated borders */}
                            <div className="absolute inset-0 rounded-lg overflow-hidden">
                                {/* Top */}
                                <div className="absolute top-0 left-0 right-0 h-[1px] w-full">
                                    <div className="absolute top-0 left-0 w-0 h-full bg-orange-500 group-hover:w-full transition-all duration-500 delay-200"></div>
                                </div>
                                
                                {/* Right */}
                                <div className="absolute top-0 right-0 bottom-0 w-[1px] h-full">
                                    <div className="absolute top-0 right-0 h-0 w-full bg-orange-500 group-hover:h-full transition-all duration-500 delay-700"></div>
                                </div>
                                
                                {/* Bottom */}
                                <div className="absolute bottom-0 left-0 right-0 h-[1px] w-full">
                                    <div className="absolute bottom-0 right-0 w-0 h-full bg-orange-500 group-hover:w-full transition-all duration-500 delay-1200 origin-right"></div>
                                </div>
                                
                                {/* Left */}
                                <div className="absolute top-0 left-0 bottom-0 w-[1px] h-full">
                                    <div className="absolute bottom-0 left-0 h-0 w-full bg-orange-500 group-hover:h-full transition-all duration-500 delay-1700 origin-bottom"></div>
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="z-10 flex flex-col items-center">
                                <span className="text-orange-500 mb-2 transition-transform group-hover:scale-110 duration-300">{data.icon}</span>
                                <span className="text-sm text-gray-300 group-hover:text-orange-500 transition-colors duration-300">{data.title}</span>
                            </div>
                            
                            {/* Subtle background effect */}
                            <div className="absolute inset-0 bg-slate-800 opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-lg"></div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GridModel;