"use client";

import { useState } from "react";
import { leaveCircle } from "../app/circles/actions";

export function LeaveCircleButton({
  circleId,
  circleName,
  isCreator,
}: {
  circleId: string;
  circleName: string;
  isCreator: boolean;
}) {
  const [isLeaving, setIsLeaving] = useState(false);

  async function handleLeave() {
    const message = isCreator
      ? `Are you sure you want to leave "${circleName}"? (You are the creator of this circle)`
      : `Are you sure you want to leave "${circleName}"?`;

    if (!window.confirm(message)) return;

    try {
      setIsLeaving(true);
      await leaveCircle(circleId);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to leave circle.");
      setIsLeaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLeave}
      disabled={isLeaving}
      className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
    >
      {isLeaving ? "Leaving..." : "Leave Circle"}
    </button>
  );
}

