import { IdeaStatus, STATUS_CONFIG } from "../lib/types";

export function StatusBadge({ status }: { status: IdeaStatus }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.spark;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.color} ${config.border}`}
    >
      {config.label}
    </span>
  );
}

