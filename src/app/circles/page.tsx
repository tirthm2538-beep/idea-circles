import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { logout } from "../auth/actions";
import { Circle } from "../../lib/types";
import { CopyButton } from "../../components/CopyButton";

export default async function CirclesPage() {
  const supabase = await createClient();

  // 1. Verify user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch the user's circles
  // RLS policy ensures only circles where the user is a member or creator are returned
  const { data: rawCircles } = await supabase
    .from("circles")
    .select("*")
    .order("created_at", { ascending: false });

  const circles = (rawCircles || []) as Circle[];

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
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition">
                Ideas
              </Link>
              <Link href="/circles" className="text-indigo-600 font-semibold transition">
                Circles
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        {/* Header & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              My Circles
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Private groups of friends, teammates, and peers who share ideas with each other.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <Link
              href="/circles/join"
              className="px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm text-center"
            >
              Join with Code
            </Link>
            <Link
              href="/circles/new"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm text-center"
            >
              + Create Circle
            </Link>
          </div>
        </div>

        {/* Circles Grid or Empty State */}
        {circles.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl mb-3">
              ⭕
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              You haven&apos;t joined any circles yet
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Circles allow you to share ideas and progress with a close group. Create your own circle or join one with a friend&apos;s invite code!
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/circles/join"
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
              >
                Join with Code
              </Link>
              <Link
                href="/circles/new"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                Create a Circle
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {circles.map((circle) => {
              const isCreator = circle.created_by === user.id;

              return (
                <div
                  key={circle.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                        {isCreator ? "Creator" : "Member"}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(circle.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 mb-1.5 line-clamp-1">
                      {circle.name}
                    </h3>

                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {circle.description || (
                        <span className="italic text-slate-400">
                          No description provided.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {circle.invite_code}
                      </span>
                      <CopyButton textToCopy={circle.invite_code} />
                    </div>

                    <Link
                      href={`/circles/${circle.id}`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
                    >
                      Open &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Idea Circles &copy; 2026 — Phase 5: Circle Management
      </footer>
    </div>
  );
}

