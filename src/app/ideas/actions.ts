"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { IdeaStatus } from "../../lib/types";

export type ActionResponse = {
  error?: string;
  success?: boolean;
};

const VALID_STATUSES: IdeaStatus[] = [
  "spark",
  "exploring",
  "building",
  "shipped",
  "parked",
];

/**
 * Creates a new idea owned by the authenticated user.
 */
export async function createIdea(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create an idea." };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";
  const status = formData.get("status") as IdeaStatus;

  if (!title) {
    return { error: "Please provide a title for your idea." };
  }

  if (!VALID_STATUSES.includes(status)) {
    return { error: "Invalid status selected." };
  }

  const { error } = await supabase.from("ideas").insert({
    user_id: user.id,
    title,
    description,
    status,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/**
 * Updates an existing idea owned by the authenticated user.
 */
export async function updateIdea(
  id: string,
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to update an idea." };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";
  const status = formData.get("status") as IdeaStatus;

  if (!title) {
    return { error: "Please provide a title for your idea." };
  }

  if (!VALID_STATUSES.includes(status)) {
    return { error: "Invalid status selected." };
  }

  const { error } = await supabase
    .from("ideas")
    .update({
      title,
      description,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/ideas/${id}`);
  redirect(`/ideas/${id}`);
}

/**
 * Deletes an idea owned by the authenticated user.
 */
export async function deleteIdea(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to delete an idea.");
  }

  const { error } = await supabase.from("ideas").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/circles");
  redirect("/dashboard");
}

/**
 * Shares or unshares an idea with a specific circle.
 * Only the idea owner can execute this (enforced by RLS).
 */
export async function toggleIdeaShare(
  ideaId: string,
  circleId: string,
  shouldShare: boolean
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to share an idea.");
  }

  if (shouldShare) {
    const { error } = await supabase.from("idea_shares").insert({
      idea_id: ideaId,
      circle_id: circleId,
    });
    if (error && error.code !== "23505") {
      // 23505 is unique violation (already shared)
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("idea_shares")
      .delete()
      .eq("idea_id", ideaId)
      .eq("circle_id", circleId);
    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath(`/ideas/${ideaId}`);
  revalidatePath(`/circles/${circleId}`);
}

/**
 * Adds a dated progress note to an idea.
 * Only the idea owner can post progress notes (enforced by RLS).
 */
export async function addProgressNote(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to add progress notes." };
  }

  const ideaId = formData.get("ideaId") as string;
  const note = (formData.get("note") as string)?.trim();

  if (!ideaId) {
    return { error: "Missing idea ID." };
  }

  if (!note) {
    return { error: "Please enter a note." };
  }

  const { error } = await supabase.from("idea_updates").insert({
    idea_id: ideaId,
    user_id: user.id,
    note,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/ideas/${ideaId}`);
  return { success: true };
}

/**
 * Deletes a progress note.
 */
export async function deleteProgressNote(noteId: string, ideaId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to delete a note.");
  }

  const { error } = await supabase
    .from("idea_updates")
    .delete()
    .eq("id", noteId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/ideas/${ideaId}`);
}
