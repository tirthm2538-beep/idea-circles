export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Skeleton Navbar */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
            <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </header>

      {/* Skeleton Body Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1 space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-72 bg-slate-200 rounded animate-pulse" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-5 w-16 bg-slate-200 rounded-full animate-pulse" />
                <div className="h-3 w-12 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

