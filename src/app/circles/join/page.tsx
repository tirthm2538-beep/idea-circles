"use client";

import { useActionState } from "react";
import Link from "next/link";
import { joinCircle, CircleActionResponse } from "../actions";

export default function JoinCirclePage() {
  const [state, formAction, isPending] = useActionState<
    CircleActionResponse,
    FormData
  >(joinCircle, {});

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Link
            href="/circles"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
          >
            &larr; Back to Circles
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Join a Circle 🤝
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter the 6-character invite code provided by the circle creator.
          </p>

          {state?.error && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <form action={formAction} className="mt-6 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="inviteCode"
                  className="block text-sm font-medium text-slate-700"
                >
                  Invite Code <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400">6 characters</span>
              </div>
              <div className="mt-1">
                <input
                  id="inviteCode"
                  name="inviteCode"
                  type="text"
                  required
                  minLength={6}
                  maxLength={10}
                  autoFocus
                  placeholder="e.g. 7A9B3F"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center font-mono text-lg uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Link
                href="/circles"
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Joining..." : "Join Circle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

