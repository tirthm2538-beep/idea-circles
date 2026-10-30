"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { updateIdea, deleteIdea, ActionResponse } from "../app/ideas/actions";
import { Idea, IdeaStatus } from "../lib/types";

const STATUSES: { value: IdeaStatus; label: string; desc: string }[] = [
  { value: "spark", label: "Spark", desc: "A raw spark of inspiration" },
  { value: "exploring", label: "Exploring", desc: "Researching and scoping" },
  { value: "building", label: "Building", desc: "Actively working on it" },
  { value: "shipped", label: "Shipped", desc: "Completed and released" },
  { value: "parked", label: "Parked", desc: "Put on pause for later" },
];

export function EditIdeaForm({ idea }: { idea: Idea }) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Bind the idea.id to updateIdea action
  const updateActionWithId = updateIdea.bind(null, idea.id);

  const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
    updateActionWithId,
    {}
  );

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${idea.title}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteIdea(idea.id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete idea.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Edit Idea
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Update your idea details or advance its lifecycle status.
          </p>
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isPending}
          className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
        >
          {isDeleting ? "Deleting..." : "Delete Idea"}
        </button>
      </div>

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
              defaultValue={idea.title}
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
              rows={5}
              maxLength={2000}
              defaultValue={idea.description}
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
            Lifecycle Status
          </label>
          <div className="mt-1">
            <select
              id="status"
              name="status"
              defaultValue={idea.status}
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

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending || isDeleting}
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

