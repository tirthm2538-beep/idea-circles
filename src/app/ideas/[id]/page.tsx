import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { StatusBadge } from "../../../components/StatusBadge";
import { ShareIdeaManager } from "../../../components/ShareIdeaManager";
import { ProgressNotesSection } from "../../../components/ProgressNotesSection";
import { Circle, IdeaUpdate } from "../../../lib/types";

export default async function IdeaDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Verify user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch the idea (RLS guarantees access only to owner OR circle members where shared)
  const { data: idea, error: ideaError } = await supabase
    .from("ideas")
    .select("*, profiles(id, email, display_name)")
    .eq("id", id)
    .single();

  if (ideaError || !idea) {
    notFound();
  }

  const isOwner = idea.user_id === user.id;

  // 3. Fetch progress notes for this idea
  const { data: rawNotes } = await supabase
    .from("idea_updates")
    .select("id, idea_id, user_id, note, created_at, profiles(id, email, display_name)")
    .eq("idea_id", id)
    .order("created_at", { ascending: false });

  const notes = (rawNotes || []) as unknown as IdeaUpdate[];

  // 4. Fetch which circles this idea is currently shared to
  const { data: rawShares } = await supabase
    .from("idea_shares")
    .select("circle_id, circles(id, name, invite_code)")
    .eq("idea_id", id);

  const sharedCircleIds = (rawShares || []).map((s) => s.circle_id);

  // 5. If the viewer is the owner, fetch all circles they belong to (to manage sharing)
  let userCircles: Circle[] = [];
  if (isOwner) {
    const { data: circles } = await supabase
      .from("circles")
      .select("*")
      .order("name", { ascending: true });
    userCircles = (circles || []) as Circle[];
  }

  const authorName =
    idea.profiles?.display_name ||
    idea.profiles?.email?.split("@")[0] ||
    "Creator";

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

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition"
            >
              &larr; Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: Idea Title, Description & Progress Notes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Idea Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <StatusBadge status={idea.status} />

                {isOwner && (
                  <Link
                    href={`/ideas/${idea.id}/edit`}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg transition"
                  >
                    Edit Idea
                  </Link>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                {idea.title}
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                <span>By <strong className="text-slate-700">{authorName}</strong></span>
                <span>&bull;</span>
                <span>Created {new Date(idea.created_at).toLocaleDateString()}</span>
              </div>

              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                {idea.description || (
                  <span className="italic text-slate-400">
                    No description provided.
                  </span>
                )}
              </div>
            </div>

            {/* Progress Notes Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
                Dated Progress Notes
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Milestones, updates, and learning logs posted over time.
              </p>

              <ProgressNotesSection
                ideaId={idea.id}
                isOwner={isOwner}
                notes={notes}
              />
            </div>
          </div>

          {/* Sidebar Column: Sharing & Circle Visibility */}
          <div className="space-y-6">
            {/* Circle Sharing Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1">
                Circle Sharing
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                {isOwner
                  ? "Choose which of your circles can see this idea and its progress notes."
                  : "This idea has been shared with you through your circles."}
              </p>

              {isOwner ? (
                <ShareIdeaManager
                  ideaId={idea.id}
                  userCircles={userCircles}
                  initialSharedCircleIds={sharedCircleIds}
                />
              ) : (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  Shared into this circle by {authorName}.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Idea Circles &copy; 2026 — Phase 6: Sharing &amp; Progress Notes
      </footer>
    </div>
  );
}

