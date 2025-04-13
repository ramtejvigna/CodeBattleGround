"use client";

import React, { useState, useEffect } from 'react';
import {
  Code,
  Flame,
  Swords,
  Trophy,
  Users,
  Clock,
  Zap,
  Terminal,
  ArrowRight,
  BookOpen,
  Github,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/lib/interfaces';
import { useTheme } from '@/context/ThemeContext';

const Home = () => {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [codeTyped, setCodeTyped] = useState('');
  const [cursor, setCursor] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const { theme } = useTheme();
  const { user } = useAuth();

  const exampleCode = `function findWinner(scores) {\n  return scores\n    .sort((a, b) => b.points - a.points)\n    .map(player => player.name)[0];\n}`;

  const challenges = [
    { title: "Algorithm Showdown", difficulty: "Hard", participants: 245, timeLeft: "2d 14h" },
    { title: "Frontend Battle", difficulty: "Medium", participants: 389, timeLeft: "23h 45m" },
    { title: "Data Structure Duel", difficulty: "Expert", participants: 126, timeLeft: "5d 8h" },
    { title: "AI Challenge", difficulty: "Medium", participants: 312, timeLeft: "1d 3h" }
  ];

  useEffect(() => {
    // Typing animation effect
    let i = 0;
    const typeEffect = setInterval(() => {
      if (i < exampleCode.length) {
        setCodeTyped(exampleCode.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typeEffect);
      }
    }, 50);

    // Cursor blinking effect
    const cursorEffect = setInterval(() => {
      setCursor(prev => !prev);
    }, 500);

    // Challenge rotation
    const challengeRotation = setInterval(() => {
      setCurrentChallenge(prev => (prev + 1) % challenges.length);
    }, 5000);

    return () => {
      clearInterval(typeEffect);
      clearInterval(cursorEffect);
      clearInterval(challengeRotation);
    };
  }, [challenges.length, exampleCode]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/allUsers', {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.success && data.users) {
          setUsers(data.users);
        } else {
          console.error('Failed to fetch users:', data.message);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // .sort((a, b) => (a.userProfile?.rank ?? Infinity) - (b.userProfile?.rank ?? Infinity)) // Use optional chaining and nullish coalescing
  // Sort the leaderboard data by rank
  const leaderboard = users && users.length > 0
  ? users
    .slice(0, 10)
    .map(player => {
      // Assign badges based on rank
      let badge = "";
      if (player.userProfile?.rank === 1) badge = "🏆";
      else if (player.userProfile?.rank === 2) badge = "🥈";
      else if (player.userProfile?.rank === 3) badge = "🥉";
      else if (player.userProfile?.rank && player.userProfile.rank <= 10) badge = "⭐";
      
      return {
        ...player,
        badge
      };
    })
  : [];

  return (
    <div className={`${theme === "dark" && "bg-gray-900 text-gray-200"} min-h-screen `}>
      {/* Hero Section */}
      <div className="pt-12 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center mb-4">
              <Flame className="text-orange-500 mr-2 animate-pulse" />
              <span className="text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text">ONGOING TOURNAMENT</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Prove Your <span className="bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text">Coding Skills</span> in Real Battles
            </h1>

            <p className="text-gray-400 mb-6">
              Compete against the best coders, solve challenging problems, and climb the leaderboard
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/challenge" className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-semibold flex items-center gap-2 transition-transform hover:translate-y-[-2px] shadow-lg shadow-orange-900/30">
                Join Battle <Swords className="w-4 h-4" />
              </Link>
              <Link href="/challenge" className={`px-6 py-3 ${theme === "dark" && "bg-gray-800" } border border-gray-700 rounded-lg font-semibold flex items-center gap-2 transition-all hover:bg-gray-750 hover:border-orange-500`}>
                Practice Now <Terminal className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className={`${theme === "dark" && "bg-gray-800 border border-gray-700"} rounded-xl p-4 shadow-xl`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="font-mono text-sm bg-gray-900 p-4 rounded-lg">
                <pre className="text-green-400">{`// Find the winner with highest points`}</pre>
                <pre className="text-gray-300">
                  {codeTyped}<span className={`${cursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>|</span>
                </pre>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 top-10 -right-10 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl"></div>
            <div className="absolute -z-10 -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>

      {/* Active Challenges Section */}
      <div className={`py-16 ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-50/50"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center">
              <Zap className="text-yellow-500 mr-2" />
              Active Challenges
            </h2>
            <button className="text-orange-500 flex items-center hover:text-orange-400 transition-colors">
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {challenges.map((challenge, index) => (
              <div
                key={index}
                className={`${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-400"} border  rounded-lg p-4 transition-all duration-300 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-900/20 ${
                  index === currentChallenge ? 'border-orange-500 shadow-lg shadow-orange-900/20 scale-105' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    challenge.difficulty === "Hard" ? "bg-red-500/20 text-red-400" :
                    challenge.difficulty === "Medium" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-purple-500/20 text-purple-400"
                  }`}>
                    {challenge.difficulty}
                  </span>
                  <Code className="text-gray-500" />
                </div>

                <h3 className="font-bold text-lg mb-3">{challenge.title}</h3>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {challenge.participants}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {challenge.timeLeft}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center">
            <Trophy className="text-yellow-500 mr-2" />
            Global Leaderboard
          </h2>
          <button className="text-orange-500 flex items-center hover:text-orange-400 transition-colors">
            Complete Rankings <ArrowRight className="ml-1 w-4 h-4" />
          </button>
        </div>

        <div className={`${theme === 'dark' ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-400/50"} rounded-xl overflow-hidden`}>
          <table className="w-full">
            <thead>
              <tr className={`${theme === 'dark' ? "bg-gray-800/70 border border-gray-700" : "bg-white border border-gray-400/50"} text-left`}>
                <th className="py-4 px-6">Rank</th>
                <th className="py-4 px-6">Warrior</th>
                <th className="py-4 px-6">Points</th>
                <th className="py-4 px-6 text-right">Badge</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((player, index) => (
                <tr
                  key={index}
                  className={`border-t border-gray-700 hover:bg-gray-750 transition-colors ${
                    player.userProfile?.rank === 1 ? `bg-gradient-to-r ${theme === "dark" ? "from-orange-900/20" : "from-orange-500/40"} to-transparent` : 
                    player.userProfile?.rank === 2 ? 'bg-gradient-to-r from-gray-700/30 to-transparent' :
                    player.userProfile?.rank === 3 ? 'bg-gradient-to-r from-yellow-700/20 to-transparent' : ''
                  }`}
                >
                  <td className="py-4 px-6 font-mono">{player.userProfile?.rank}</td>
                  <td className="py-4 px-6 font-semibold">{player.username}</td>
                  <td className="py-4 px-6 text-orange-400 font-mono">{player.userProfile?.points.toLocaleString()}</td>
                  <td className="py-4 px-6 text-right">{player.badge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-16 ${theme === "dark" ? "bg-gray-800/50" : "bg-gray-50/50"}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-2xl font-bold mb-10 text-center">
            The Ultimate <span className="bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text">Coding Competition</span> Platform
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-6 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-400"} hover:border-orange-500 shadow-xl rounded-xl transition-all group`}>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
                <Terminal className="text-orange-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Real-time Challenges</h3>
              <p className="text-gray-400">Compete in timed coding challenges against coders from around the world.</p>
            </div>

            <div className={`p-6 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-400"} hover:border-orange-500 shadow-xl rounded-xl transition-all group`}>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
                <BookOpen className="text-orange-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Learning Pathways</h3>
              <p className="text-gray-400">Master algorithms, data structures, and problem-solving through guided learning paths.</p>
            </div>

            <div className={`p-6 ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-400"} hover:border-orange-500 shadow-xl rounded-xl transition-all group`}>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/30 transition-colors">
                <Award className="text-orange-500" />
              </div>
              <h3 className="text-lg font-bold mb-2">Earn Certifications</h3>
              <p className="text-gray-400">Showcase your skills with industry-recognized certifications and badges.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="py-16 px-6 md:px-12 max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Level Up Your Coding Skills?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">Join thousands of developers who are improving their skills and building their reputation on Code Battle Ground.</p>

          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-semibold flex items-center gap-2 transition-transform hover:translate-y-[-2px] shadow-lg shadow-orange-900/30">
              Sign Up Free <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-3 bg-gray-800 border border-gray-700 rounded-lg font-semibold flex items-center gap-2 transition-all hover:bg-gray-750 hover:border-orange-500">
              <Github className="w-4 h-4" /> Login with GitHub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;