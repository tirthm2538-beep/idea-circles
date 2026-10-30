"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export type AuthState = {
  error?: string;
  success?: string;
};

/**
 * Signs in an existing user with email & password.
 */
export async function login(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * Signs up a new user with email, password, and optional display name.
 * The database trigger 'on_auth_user_created' automatically creates their row in 'profiles'.
 */
export async function signup(prevState: AuthState | null, formData: FormData): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const displayName = (formData.get("displayName") as string)?.trim();

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split("@")[0],
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If Supabase has email confirmation enabled, user session won't be active immediately
  if (data.user && data.session === null) {
    return {
      success:
        "Account created! Please check your email for a confirmation link before logging in (or disable email confirmations in Supabase Auth settings for local testing).",
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * Signs out the currently authenticated user and clears cookies.
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

