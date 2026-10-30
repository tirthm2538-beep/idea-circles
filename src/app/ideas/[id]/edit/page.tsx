import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../../lib/supabase/server";
import { EditIdeaForm } from "../../../../components/EditIdeaForm";
import { Idea } from "../../../../lib/types";

export default async function EditIdeaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the specific idea (RLS guarantees only the owner can read it here)
  const { data: idea, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !idea) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
          >
            &larr; Back to Dashboard
          </Link>
        </div>

        <EditIdeaForm idea={idea as Idea} />
      </div>
    </div>
  );
}

