"use client";

import Link from 'next/link';

export default function UserNotFound() {
  return (
    <div className="bg-gray-900 min-h-screen text-gray-200 flex items-center justify-center">
      <div className="text-center p-8 bg-gray-800 rounded-xl border border-gray-700 max-w-md">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p className="text-gray-400 mb-6">
          The profile you're looking for doesn't exist or is not accessible.
        </p>
        <Link href="/profile" className="px-6 py-3 bg-orange-600 rounded-lg font-semibold inline-block transition-transform hover:translate-y-[-2px]">
          Go to Your Profile
        </Link>
      </div>
    </div>
  );
} 