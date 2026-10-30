"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createIdea, ActionResponse } from "../actions";
import { IdeaStatus } from "../../../lib/types";

const STATUSES: { value: IdeaStatus; label: string; desc: string }[] = [
  { value: "spark", label: "Spark", desc: "A raw spark of inspiration" },
  { value: "exploring", label: "Exploring", desc: "Researching and scoping" },
  { value: "building", label: "Building", desc: "Actively working on it" },
  { value: "shipped", label: "Shipped", desc: "Completed and released" },
  { value: "parked", label: "Parked", desc: "Put on pause for later" },
];

export default function NewIdeaPage() {
  const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
    createIdea,
    {}
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Navigation header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
          >
            &larr; Back to Dashboard
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Capture a New Idea 💡
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Write down your idea and assign its current stage. You can share it into circles in the next phase.
          </p>

          {/* Error Message */}
          {state?.error && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <form action={formAction} className="mt-6 space-y-6">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate-700"
                >
                  Idea Title <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400">Max 120 chars</span>
              </div>
              <div className="mt-1">
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  minLength={2}
                  maxLength={120}
                  placeholder="e.g. AI-powered recipe generator"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700"
                >
                  Description / Notes
                </label>
                <span className="text-xs text-slate-400">Max 2000 chars</span>
              </div>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  maxLength={2000}
                  placeholder="What is the problem? How does it work? What are the next steps?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-slate-700"
              >
                Current Status
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  name="status"
                  defaultValue="spark"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
                >
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label} — {s.desc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Saving Idea..." : "Save Idea"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

