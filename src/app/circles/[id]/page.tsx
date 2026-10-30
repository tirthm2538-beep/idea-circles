import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { CopyButton } from "../../../components/CopyButton";
import { LeaveCircleButton } from "../../../components/LeaveCircleButton";
import { StatusBadge } from "../../../components/StatusBadge";
import { IdeaStatus } from "../../../lib/types";

interface SharedIdeaRow {
  idea_id: string;
  ideas: {
    id: string;
    title: string;
    description: string;
    status: IdeaStatus;
    created_at: string;
    user_id: string;
    profiles: {
      id: string;
      email: string;
      display_name: string;
    } | null;
  } | null;
}

interface NoteRow {
  id: string;
  idea_id: string;
  note: string;
  created_at: string;
  profiles: {
    id: string;
    email: string;
    display_name: string;
  } | null;
}

export default async function CircleDetailsPage({
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

  // 2. Fetch circle details (RLS ensures only members or creator can access)
  const { data: circle, error: circleError } = await supabase
    .from("circles")
    .select("*")
    .eq("id", id)
    .single();

  if (circleError || !circle) {
    notFound();
  }

  // 3. Fetch circle members with their profiles
  const { data: rawMembers } = await supabase
    .from("circle_members")
    .select("circle_id, user_id, joined_at, profiles(id, email, display_name)")
    .eq("circle_id", id)
    .order("joined_at", { ascending: true });

  interface MemberRow {
    circle_id: string;
    user_id: string;
    joined_at: string;
    profiles: {
      id: string;
      email: string;
      display_name: string;
    } | null;
  }

  const members = (rawMembers || []) as unknown as MemberRow[];
  const isCreator = circle.created_by === user.id;

  // 4. Fetch all ideas shared into this circle
  const { data: rawSharedRows } = await supabase
    .from("idea_shares")
    .select("idea_id, ideas(id, title, description, status, created_at, user_id, profiles(id, email, display_name))")
    .eq("circle_id", id);

  const sharedRows = (rawSharedRows || []) as unknown as SharedIdeaRow[];
  const sharedIdeas = sharedRows
    .map((r) => r.ideas)
    .filter((idea): idea is NonNullable<typeof idea> => idea !== null);

  // 5. Fetch latest progress notes for these shared ideas
  const sharedIdeaIds = sharedIdeas.map((i) => i.id);
  let latestNotesByIdeaId: Record<string, NoteRow> = {};

  if (sharedIdeaIds.length > 0) {
    const { data: rawNotes } = await supabase
      .from("idea_updates")
      .select("id, idea_id, note, created_at, profiles(id, email, display_name)")
      .in("idea_id", sharedIdeaIds)
      .order("created_at", { ascending: false });

    const notes = (rawNotes || []) as unknown as NoteRow[];
    // Group to pick the single newest note for each idea
    notes.forEach((note) => {
      if (!latestNotesByIdeaId[note.idea_id]) {
        latestNotesByIdeaId[note.idea_id] = note;
      }
    });
  }

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

          <div>
            <Link
              href="/circles"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 transition"
            >
              &larr; All Circles
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">
        {/* Circle Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="inline-block px-3 py-1 mb-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full">
                Circle
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {circle.name}
              </h1>
              <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
                {circle.description || (
                  <span className="italic text-slate-400">
                    No description provided for this circle.
                  </span>
                )}
              </p>
            </div>

            {/* Leave Circle Button */}
            <div className="shrink-0">
              <LeaveCircleButton
                circleId={circle.id}
                circleName={circle.name}
                isCreator={isCreator}
              />
            </div>
          </div>

          {/* Invite Code Bar */}
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                Circle Invite Code
              </span>
              <span className="font-mono text-lg font-bold text-slate-900 tracking-wider">
                {circle.invite_code}
              </span>
              <span className="text-xs text-slate-500 ml-2">
                (Share this 6-character code with friends so they can join)
              </span>
            </div>
            <CopyButton textToCopy={circle.invite_code} />
          </div>
        </div>

        {/* Two-Column Layout: Members & Shared Ideas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Members List (1 column on desktop) */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Members</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {members.length}
                </span>
              </h2>

              <ul className="divide-y divide-slate-100">
                {members.map((m) => {
                  const isUserCreator = m.user_id === circle.created_by;
                  const isCurrentUser = m.user_id === user.id;
                  const name =
                    m.profiles?.display_name ||
                    m.profiles?.email?.split("@")[0] ||
                    "Member";

                  return (
                    <li key={m.user_id} className="py-3 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {name}
                          </p>
                          {isCurrentUser && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {m.profiles?.email}
                        </p>
                      </div>

                      {isUserCreator && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                          Creator
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Ideas Shared Into Circle (2 columns on desktop) */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Ideas in this Circle
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Every idea shared into this circle with its status and latest progress note.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {sharedIdeas.length} {sharedIdeas.length === 1 ? "Idea" : "Ideas"}
                </span>
              </div>

              {sharedIdeas.length === 0 ? (
                <div className="border border-dashed border-slate-200 bg-slate-50/50 rounded-xl p-8 text-center">
                  <span className="text-2xl mb-2 block">💡</span>
                  <h3 className="text-sm font-semibold text-slate-900">
                    No ideas shared yet
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Circle members can share their ideas into this circle from their ideas list on the dashboard.
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition"
                    >
                      Go to My Ideas &rarr;
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {sharedIdeas.map((idea) => {
                    const latestNote = latestNotesByIdeaId[idea.id];
                    const authorName =
                      idea.profiles?.display_name ||
                      idea.profiles?.email?.split("@")[0] ||
                      "Author";

                    return (
                      <div
                        key={idea.id}
                        className="p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition bg-white shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Header: Status & Author */}
                          <div className="flex items-center justify-between mb-2">
                            <StatusBadge status={idea.status} />
                            <span className="text-xs text-slate-500">
                              By <strong className="text-slate-700">{authorName}</strong>
                            </span>
                          </div>

                          {/* Idea Title */}
                          <Link
                            href={`/ideas/${idea.id}`}
                            className="text-base font-bold text-slate-900 hover:text-indigo-600 transition block mb-1.5"
                          >
                            {idea.title}
                          </Link>

                          {/* Idea Description */}
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                            {idea.description || (
                              <span className="italic text-slate-400">
                                No description provided.
                              </span>
                            )}
                          </p>

                          {/* Feature 6 Requirement: Latest Note */}
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              Latest Progress Note:
                            </span>
                            {latestNote ? (
                              <div>
                                <p className="text-xs text-slate-800 line-clamp-2 leading-relaxed italic">
                                  &ldquo;{latestNote.note}&rdquo;
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(latestNote.created_at).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(latestNote.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">
                                No progress notes posted yet.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Link */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                          <Link
                            href={`/ideas/${idea.id}`}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                          >
                            Open Idea &amp; All Notes &rarr;
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        Idea Circles &copy; 2026 — Phase 6: Idea Sharing &amp; Circles
      </footer>
    </div>
  );
}
