"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export type CircleActionResponse = {
  error?: string;
  success?: boolean;
};

/**
 * Creates a new circle.
 * The database trigger 'on_circle_created' automatically adds the creator to 'circle_members'.
 */
export async function createCircle(
  prevState: CircleActionResponse | null,
  formData: FormData
): Promise<CircleActionResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create a circle." };
  }

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || "";

  if (!name) {
    return { error: "Please provide a name for your circle." };
  }

  const { data, error } = await supabase
    .from("circles")
    .insert({
      name,
      description,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/circles");
  revalidatePath("/dashboard");
  redirect(`/circles/${data.id}`);
}

/**
 * Joins an existing circle using its 6-character invite code.
 * Calls the PostgreSQL function 'join_circle_with_code'.
 */
export async function joinCircle(
  prevState: CircleActionResponse | null,
  formData: FormData
): Promise<CircleActionResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to join a circle." };
  }

  const code = (formData.get("inviteCode") as string)?.trim().toUpperCase();

  if (!code) {
    return { error: "Please enter an invite code." };
  }

  // Call the database function defined in Phase 2
  const { data: circleId, error } = await supabase.rpc("join_circle_with_code", {
    code,
  });

  if (error) {
    return { error: error.message || "Invalid invite code." };
  }

  revalidatePath("/circles");
  revalidatePath("/dashboard");
  redirect(`/circles/${circleId}`);
}

/**
 * Leaves a circle by removing the user's row from 'circle_members'.
 */
export async function leaveCircle(circleId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in to leave a circle.");
  }

  const { error } = await supabase
    .from("circle_members")
    .delete()
    .eq("circle_id", circleId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/circles");
  revalidatePath("/dashboard");
  redirect("/circles");
}

