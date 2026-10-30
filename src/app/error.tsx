"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for debugging
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-xl mb-4 font-bold">
          !
        </div>

        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          {error.message ||
            "An unexpected error occurred while loading this page. Please try again or return to the dashboard."}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

