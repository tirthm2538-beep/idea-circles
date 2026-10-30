"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createCircle, CircleActionResponse } from "../actions";

export default function NewCirclePage() {
  const [state, formAction, isPending] = useActionState<
    CircleActionResponse,
    FormData
  >(createCircle, {});

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
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
            Create a New Circle ⭕
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            A circle is a private group for friends, co-founders, or peers.
            A unique 6-character invite code will be automatically generated for you to invite others.
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
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700"
                >
                  Circle Name <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400">Max 80 chars</span>
              </div>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="e.g. Hackathon Team, Founders Circle, Study Group"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700"
                >
                  Description
                </label>
                <span className="text-xs text-slate-400">Max 500 chars</span>
              </div>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  maxLength={500}
                  placeholder="What is this circle about? Who is it for?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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
                {isPending ? "Creating Circle..." : "Create Circle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

