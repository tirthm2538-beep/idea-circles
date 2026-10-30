export type IdeaStatus = "spark" | "exploring" | "building" | "shipped" | "parked";

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    email: string;
    display_name: string;
  };
}

export interface Circle {
  id: string;
  name: string;
  description: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface CircleMember {
  circle_id: string;
  user_id: string;
  joined_at: string;
  profiles?: {
    id: string;
    email: string;
    display_name: string;
  };
}

export interface IdeaShare {
  id: string;
  idea_id: string;
  circle_id: string;
  shared_at: string;
  circles?: Circle;
}

export interface IdeaUpdate {
  id: string;
  idea_id: string;
  user_id: string;
  note: string;
  created_at: string;
  profiles?: {
    id: string;
    email: string;
    display_name: string;
  };
}

export const STATUS_CONFIG: Record<
  IdeaStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  spark: {
    label: "Spark",
    color: "text-amber-800",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  exploring: {
    label: "Exploring",
    color: "text-sky-800",
    bg: "bg-sky-50",
    border: "border-sky-200",
  },
  building: {
    label: "Building",
    color: "text-indigo-800",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  shipped: {
    label: "Shipped",
    color: "text-emerald-800",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  parked: {
    label: "Parked",
    color: "text-slate-700",
    bg: "bg-slate-100",
    border: "border-slate-300",
  },
};
