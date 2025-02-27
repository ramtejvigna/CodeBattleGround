"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Cpu,
    Trophy,
    Users,
    Zap,
    Activity,
    BookMarked,
    Terminal
} from 'lucide-react';

const GridModel = () => {
    const categories = [
        {
            title: "Challenges",
            icon: <Zap className="h-6 w-6 text-orange-400" />,
            description: "Test your skills with coding challenges",
            url: "/challenges"
        },
        {
            title: "Tournaments",
            icon: <Trophy className="h-6 w-6 text-yellow-400" />,
            description: "Compete against other coders",
            url: "/tournaments"
        },
        {
            title: "Learning Path",
            icon: <BookOpen className="h-6 w-6 text-blue-400" />,
            description: "Structured learning material",
            url: "/learning"
        },
        {
            title: "Code Arena",
            icon: <Terminal className="h-6 w-6 text-green-400" />,
            description: "Practice coding in real-time",
            url: "/coding"
        },
        {
            title: "Algorithms",
            icon: <Cpu className="h-6 w-6 text-purple-400" />,
            description: "Algorithm explanations and challenges",
            url: "/algorithms"
        },
        {
            title: "Community",
            icon: <Users className="h-6 w-6 text-pink-400" />,
            description: "Connect with other developers",
            url: "/community"
        },
        {
            title: "Your Progress",
            icon: <Activity className="h-6 w-6 text-red-400" />,
            description: "Track your coding journey",
            url: "/progress"
        },
        {
            title: "Resources",
            icon: <BookMarked className="h-6 w-6 text-teal-400" />,
            description: "Helpful coding resources",
            url: "/resources"
        },
    ];

    return (
        <motion.div
            className="absolute right-0 top-16 w-[560px] bg-gray-900 border border-gray-800 rounded-md shadow-xl z-50"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
        >
            <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Explore Platform</h3>

                <div className="grid grid-cols-2 gap-4">
                    {categories.map((category, index) => (
                        <Link key={category.title} href={category.url}>
                            <motion.div
                                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    transition: { delay: index * 0.05 }
                                }}
                            >
                                <div className="rounded-full bg-gray-800 p-2 flex-shrink-0">
                                    {category.icon}
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">{category.title}</h4>
                                    <p className="text-sm text-gray-400 mt-1">{category.description}</p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="bg-gray-800 p-4 flex items-center justify-between rounded-b-md">
                <p className="text-sm text-gray-400">Unlock all features by completing challenges</p>
                <Link href="/premium">
                    <motion.button
                        className="text-sm font-medium text-white px-4 py-1.5 bg-gradient-to-tr from-[#F14A00] to-[#C62300] rounded-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Go Premium
                    </motion.button>
                </Link>
            </div>
        </motion.div>
    );
};

export default GridModel;