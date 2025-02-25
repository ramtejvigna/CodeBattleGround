"use client";

import React, { useState } from 'react';
import { Award, Check, Code, Star, BookOpen, Globe, Database, Server, CloudCog, ChevronRight, Clock, Users, Zap, Lock } from 'lucide-react';

const CertificationsPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Certifications' },
    { id: 'algorithms', name: 'Algorithms & Data Structures' },
    { id: 'frontend', name: 'Frontend Development' },
    { id: 'backend', name: 'Backend Development' },
    { id: 'cloud', name: 'Cloud Computing' },
    { id: 'ai', name: 'AI & Machine Learning' }
  ];

  const certifications = [
    {
      id: 1,
      title: "Algorithm Mastery",
      icon: Code,
      description: "Master advanced algorithms and data structures with this comprehensive certification.",
      category: "algorithms",
      difficulty: "Advanced",
      duration: "10 hours",
      price: "Free",
      participants: 15240,
      highlights: [
        "Graph algorithms",
        "Dynamic programming",
        "Greedy algorithms",
        "Divide and conquer",
        "Tree structures"
      ]
    },
    {
      id: 2,
      title: "React Development Expert",
      icon: Globe,
      description: "Become an expert React developer by mastering modern concepts and best practices.",
      category: "frontend",
      difficulty: "Intermediate",
      duration: "8 hours",
      price: "$29.99",
      participants: 8750,
      highlights: [
        "React Hooks",
        "State management",
        "Performance optimization",
        "React Router",
        "Testing React applications"
      ]
    },
    {
      id: 3,
      title: "Backend Engineering",
      icon: Server,
      description: "Learn everything about building scalable backend systems and APIs.",
      category: "backend",
      difficulty: "Intermediate",
      duration: "12 hours",
      price: "$39.99",
      participants: 6320,
      highlights: [
        "RESTful API design",
        "Database optimization",
        "Authentication systems",
        "Microservices architecture",
        "Serverless functions"
      ]
    },
    {
      id: 4,
      title: "Cloud Architecture",
      icon: CloudCog,
      description: "Master cloud infrastructure and deployment strategies for enterprise applications.",
      category: "cloud",
      difficulty: "Advanced",
      duration: "15 hours",
      price: "$49.99",
      participants: 4120,
      highlights: [
        "Multi-cloud strategies",
        "Infrastructure as Code",
        "Cloud security",
        "Scalability patterns",
        "Cost optimization"
      ]
    },
    {
      id: 5,
      title: "Machine Learning Fundamentals",
      icon: Database,
      description: "Build a solid foundation in machine learning algorithms and applications.",
      category: "ai",
      difficulty: "Beginner",
      duration: "8 hours",
      price: "$19.99",
      participants: 9840,
      highlights: [
        "Supervised learning",
        "Unsupervised learning",
        "Model evaluation",
        "Feature engineering",
        "Python libraries for ML"
      ]
    },
    {
      id: 6,
      title: "Data Structures Deep Dive",
      icon: BookOpen,
      description: "Understand complex data structures and their implementation from the ground up.",
      category: "algorithms",
      difficulty: "Intermediate",
      duration: "6 hours",
      price: "Free",
      participants: 11260,
      highlights: [
        "Hash tables",
        "Balanced trees",
        "Heap structures",
        "Priority queues",
        "Custom data structures"
      ]
    }
  ];

  const filteredCertifications = activeCategory === 'all' 
    ? certifications 
    : certifications.filter(cert => cert.category === activeCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 pb-16">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 py-12 mb-8">
        <div className="container mx-auto px-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-tr from-[#F14A00] to-[#C62300] bg-clip-text text-transparent">
              Battle-Tested
            </span> Certifications
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Level up your skills with our industry-recognized certifications and stand out in the competitive coding world.
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-8 mb-8">
        <div className="flex flex-wrap gap-3">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-tr from-[#F14A00] to-[#C62300] text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Certifications Grid */}
      <div className="container mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertifications.map(cert => (
            <div 
              key={cert.id}
              className="bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 hover:border-gray-600 transition-all duration-300 group"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-gray-700 text-orange-500">
                    <cert.icon size={24} />
                  </div>
                  <div className={`${getDifficultyColor(cert.difficulty)} text-white text-xs font-medium px-2 py-1 rounded`}>
                    {cert.difficulty}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{cert.title}</h3>
                <p className="text-gray-400 text-sm">{cert.description}</p>
              </div>
              
              {/* Card Details */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock size={16} />
                    <span>{cert.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users size={16} />
                    <span>{formatNumber(cert.participants)} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Zap size={16} />
                    <span>{cert.highlights.length} modules</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {cert.price === "Free" ? (
                      <span className="text-green-500">{cert.price}</span>
                    ) : (
                      <span className="text-gray-200">{cert.price}</span>
                    )}
                  </div>
                </div>
                
                {/* Highlights */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">What you'll learn</h4>
                  <ul className="space-y-2">
                    {cert.highlights.slice(0, 3).map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-400">
                        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                    {cert.highlights.length > 3 && (
                      <li className="text-sm text-gray-500">
                        + {cert.highlights.length - 3} more topics
                      </li>
                    )}
                  </ul>
                </div>
                
                {/* CTA Button */}
                <button className="w-full py-3 rounded-lg bg-gradient-to-tr from-[#F14A00] to-[#C62300] text-white font-medium flex justify-center items-center gap-2 hover:shadow-lg hover:shadow-orange-900/20 transition-all duration-300 group-hover:scale-[1.02]">
                  Start Certification
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificationsPage;