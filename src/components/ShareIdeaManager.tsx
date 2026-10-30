"use client";

import { useState } from "react";
import { Circle } from "../lib/types";
import { toggleIdeaShare } from "../app/ideas/actions";

export function ShareIdeaManager({
  ideaId,
  userCircles,
  initialSharedCircleIds,
}: {
  ideaId: string;
  userCircles: Circle[];
  initialSharedCircleIds: string[];
}) {
  const [sharedCircleIds, setSharedCircleIds] = useState<string[]>(
    initialSharedCircleIds
  );
  const [loadingCircleId, setLoadingCircleId] = useState<string | null>(null);

  async function handleToggle(circleId: string) {
    const isCurrentlyShared = sharedCircleIds.includes(circleId);
    const newShouldShare = !isCurrentlyShared;

    setLoadingCircleId(circleId);

    try {
      await toggleIdeaShare(ideaId, circleId, newShouldShare);

      setSharedCircleIds((prev) =>
        newShouldShare ? [...prev, circleId] : prev.filter((id) => id !== circleId)
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update sharing.");
    } finally {
      setLoadingCircleId(null);
    }
  }

  if (userCircles.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600">
        You are not a member of any circles yet.{" "}
        <a href="/circles/new" className="text-indigo-600 font-semibold underline">
          Create a circle
        </a>{" "}
        or{" "}
        <a href="/circles/join" className="text-indigo-600 font-semibold underline">
          join one
        </a>{" "}
        to share this idea!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {userCircles.map((circle) => {
        const isShared = sharedCircleIds.includes(circle.id);
        const isLoading = loadingCircleId === circle.id;

        return (
          <label
            key={circle.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition cursor-pointer ${
              isShared
                ? "bg-indigo-50/60 border-indigo-200"
                : "bg-white border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isShared}
                disabled={isLoading}
                onChange={() => handleToggle(circle.id)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold text-slate-900 block">
                  {circle.name}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Code: {circle.invite_code}
                </span>
              </div>
            </div>

            <span className="text-xs font-medium">
              {isLoading ? (
                <span className="text-slate-400">Updating...</span>
              ) : isShared ? (
                <span className="text-indigo-700 font-semibold">Shared ✓</span>
              ) : (
                <span className="text-slate-400">Not shared</span>
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}

