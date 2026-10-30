import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto text-xl mb-4 font-semibold">
          404
        </div>

        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Page or Idea Not Found
        </h1>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed">
          The idea or circle you are looking for doesn&apos;t exist, or you don&apos;t have permission to view it (due to circle privacy).
        </p>

        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm text-center"
          >
            My Ideas
          </Link>
          <Link
            href="/circles"
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition text-center"
          >
            My Circles
          </Link>
        </div>
      </div>
    </div>
  );
}

