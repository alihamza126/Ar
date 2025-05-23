"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-12 overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-indigo-300 opacity-70 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-blue-300 opacity-70 blur-3xl animate-pulse animation-delay-2000"></div>

      {/* Content Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="text-6xl">📖</div>
          <h1 className="mt-4 text-center text-4xl font-extrabold text-indigo-800">
            Library Management<br/>System
          </h1>
          <p className="mt-2 text-center text-gray-600">
            Manage books, track borrowings, and streamline your library experience.
          </p>
        </div>

        {/* Three Login Buttons */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <Link
            href="/admin"
            className="block rounded-full bg-red-600 px-6 py-3 text-center text-lg font-semibold text-white hover:bg-red-700 transition"
          >
            Admin Login
          </Link>
          <Link
            href="/teacher"
            className="block rounded-full bg-green-600 px-6 py-3 text-center text-lg font-semibold text-white hover:bg-green-700 transition"
          >
            Teacher Login
          </Link>
          <Link
            href="/student/dashboard"
            className="block rounded-full bg-indigo-600 px-6 py-3 text-center text-lg font-semibold text-white hover:bg-indigo-700 transition"
          >
            Student Login
          </Link>

          {/* Register Button */}
          <div className="mt-3"></div>
          <hr />
          <Link
            href="/register"
            className="block rounded-full bg-blue-600 px-2 py-2 text-center text-lg font-semibold text-white hover:bg-blue-700 transition"
          >
            Register New User
          </Link>
        </div>
      </div>
    </main>
  );
}
