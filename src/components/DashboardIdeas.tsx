"use client";

import { useState } from "react";
import Link from "next/link";
import { Idea, STATUS_CONFIG } from "../lib/types";
import { StatusBadge } from "./StatusBadge";
import { deleteIdea } from "../app/ideas/actions";

export function DashboardIdeas({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const statuses: { key: string; label: string }[] = [
    { key: "all", label: "All" },
    { key: "spark", label: "Sparks" },
    { key: "exploring", label: "Exploring" },
    { key: "building", label: "Building" },
    { key: "shipped", label: "Shipped" },
    { key: "parked", label: "Parked" },
  ];

  const filteredIdeas =
    filter === "all"
      ? initialIdeas
      : initialIdeas.filter((idea) => idea.status === filter);

  async function handleDelete(id: string, title: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteIdea(id);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete idea.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {/* Filter Tabs & New Idea Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((tab) => {
            const count =
              tab.key === "all"
                ? initialIdeas.length
                : initialIdeas.filter((i) => i.status === tab.key).length;

            const isActive = filter === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-indigo-700 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* New Idea Button */}
        <Link
          href="/ideas/new"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition shrink-0 w-full sm:w-auto text-center"
        >
          + Capture Idea
        </Link>
      </div>

      {/* Ideas List or Empty State */}
      {filteredIdeas.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl mb-3">
            💡
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {filter === "all"
              ? "No ideas captured yet"
              : `No ideas in "${filter}" status`}
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {filter === "all"
              ? "Every great project begins as a spark. Capture your first idea and track its progress from idea to shipped!"
              : "Try switching to another filter or create a new idea with this status."}
          </p>
          {filter === "all" && (
            <div className="mt-6">
              <Link
                href="/ideas/new"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition w-full sm:w-auto"
              >
                Capture Your First Idea
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas.map((idea) => {
            const isDeleting = deletingId === idea.id;

            return (
              <div
                key={idea.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <StatusBadge status={idea.status} />
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(idea.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    href={`/ideas/${idea.id}`}
                    className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition mb-1.5 line-clamp-1 block"
                  >
                    {idea.title}
                  </Link>

                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {idea.description || (
                      <span className="italic text-slate-400">
                        No description provided.
                      </span>
                    )}
                  </p>
                </div>

                {/* Card footer actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/ideas/${idea.id}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition py-1"
                    >
                      Open &rarr;
                    </Link>
                    <Link
                      href={`/ideas/${idea.id}/edit`}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 transition py-1"
                    >
                      Edit
                    </Link>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(idea.id, idea.title)}
                    disabled={isDeleting}
                    className="text-xs font-medium text-slate-400 hover:text-red-600 transition disabled:opacity-50 cursor-pointer py-1"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
