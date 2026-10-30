import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { logout } from "../auth/actions";
import { DashboardIdeas } from "../../components/DashboardIdeas";
import { Idea } from "../../lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Get current logged-in user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch the user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name, created_at")
    .eq("id", user.id)
    .single();

  // 3. Fetch all ideas belonging to the user (ordered newest first)
  // Row Level Security ensures only this user's ideas are returned
  const { data: rawIdeas } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  const ideas = (rawIdeas || []) as Idea[];
  const displayName = profile?.display_name || user.email?.split("@")[0] || "Friend";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-6">
            <Link href="/dashboard" className="text-lg sm:text-xl font-bold tracking-tight text-indigo-600">
              Idea Circles
            </Link>
            <nav className="flex space-x-3 sm:space-x-4 text-sm font-medium">
              <Link href="/dashboard" className="text-indigo-600 font-semibold transition">
                Ideas
              </Link>
              <Link href="/circles" className="text-slate-600 hover:text-slate-900 transition">
                Circles
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-xs sm:text-sm text-slate-600 hidden md:inline truncate max-w-[150px]">
              {displayName}
            </span>

            {/* Logout button */}
            <form action={logout}>
              <button
                type="submit"
                className="px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition cursor-pointer"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        {/* Welcome & Stats Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Ideas
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Capture, organize, and advance your thoughts through structured stages.
          </p>
        </div>

        {/* Ideas Grid with Status Filters */}
        <DashboardIdeas initialIdeas={ideas} />

        {/* User Profile Info Footer Accordion */}
        <div className="mt-12 pt-6 border-t border-slate-200">
          <details className="text-xs text-slate-500 group">
            <summary className="cursor-pointer font-medium hover:text-slate-700 transition">
              View Profile &amp; Account Details &#9662;
            </summary>
            <div className="mt-3 p-4 bg-white rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="block text-slate-400">Email:</span>
                <span className="text-slate-700 font-medium">{user.email}</span>
              </div>
              <div>
                <span className="block text-slate-400">Display Name:</span>
                <span className="text-slate-700 font-medium">{displayName}</span>
              </div>
              <div>
                <span className="block text-slate-400">User ID:</span>
                <span className="text-slate-700 font-mono truncate block">
                  {user.id}
                </span>
              </div>
            </div>
          </details>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Idea Circles &copy; 2026 — Phase 4: Ideas Management
      </footer>
    </div>
  );
}
