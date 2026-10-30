import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-indigo-600">
              Idea Circles
            </span>
          </div>

          <nav className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
            >
              Log In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-4 text-center max-w-3xl mx-auto">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full">
            Built for creators, tinkerers & friends
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Capture raw ideas. <br className="hidden sm:inline" />
            Grow them with people you trust.
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Stop losing ideas in random notes apps. Record your sparks, track
            progress from building to shipped, and share updates inside private
            invite-code circles.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/login"
              className="px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition"
            >
              Start Capturing Ideas
            </Link>
          </div>
        </section>

        {/* Core Features Preview */}
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-12">
              How Idea Circles Works
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1: Lifecycle statuses */}
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Track Idea Lifecycle
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Move ideas through structured states: <span className="font-semibold text-slate-800">Spark</span>,{" "}
                  <span className="font-semibold text-slate-800">Exploring</span>,{" "}
                  <span className="font-semibold text-slate-800">Building</span>,{" "}
                  <span className="font-semibold text-slate-800">Shipped</span>, or{" "}
                  <span className="font-semibold text-slate-800">Parked</span>.
                </p>
              </div>

              {/* Feature 2: Invite-only circles */}
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Private Circles
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Create small circles for your hackathon team, study group, or
                  close friends using simple invite codes.
                </p>
              </div>

              {/* Feature 3: Progress notes */}
              <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  Dated Progress Notes
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Log your milestones and updates over time. Circle members stay
                  in the loop with the latest breakthroughs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
        <p>Idea Circles &copy; 2026 — Built with Next.js, Supabase & Tailwind CSS.</p>
      </footer>
    </div>
  );
}
