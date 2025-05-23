// app/denied/page.jsx
"use client";

import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-red-100 px-6 py-12 overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full bg-red-300 opacity-70 blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-red-200 opacity-70 blur-3xl animate-pulse animation-delay-2000"></div>

      {/* Content Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-10 shadow-2xl text-center">
        <div className="flex flex-col items-center">
          <div className="text-6xl">🚫</div>
          <h1 className="mt-4 text-3xl font-extrabold text-red-700">
            Access Denied
          </h1>
          <p className="mt-2 text-gray-600">
            You don’t have permission to view this page.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-block rounded-full bg-red-600 px-6 py-3 text-white font-semibold transition hover:bg-red-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
