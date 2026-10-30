"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { IdeaUpdate } from "../lib/types";
import { addProgressNote, deleteProgressNote, ActionResponse } from "../app/ideas/actions";

export function ProgressNotesSection({
  ideaId,
  isOwner,
  notes,
}: {
  ideaId: string;
  isOwner: boolean;
  notes: IdeaUpdate[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [noteLength, setNoteLength] = useState(0);

  const [state, formAction, isPending] = useActionState<ActionResponse, FormData>(
    addProgressNote,
    {}
  );

  // Clear form when note is added successfully
  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
      setNoteLength(0);
    }
  }, [state]);

  async function handleDeleteNote(noteId: string) {
    if (!window.confirm("Are you sure you want to delete this progress note?")) {
      return;
    }

    try {
      setDeletingId(noteId);
      await deleteProgressNote(noteId, ideaId);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete note.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Form to add a new note (Idea Owner Only) */}
      {isOwner && (
        <form
          ref={formRef}
          action={formAction}
          className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200"
        >
          <input type="hidden" name="ideaId" value={ideaId} />

          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="note"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
            >
              + Post a Progress Note
            </label>
            <span
              className={`text-[11px] font-mono ${
                noteLength > 900 ? "text-amber-600 font-bold" : "text-slate-400"
              }`}
            >
              {noteLength}/1000
            </span>
          </div>

          {state?.error && (
            <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {state.error}
            </div>
          )}

          <div className="space-y-3">
            <textarea
              id="note"
              name="note"
              rows={3}
              required
              maxLength={1000}
              placeholder="What did you build today? What was the blocker or milestone?"
              onChange={(e) => setNoteLength(e.target.value.length)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending || noteLength === 0}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50 cursor-pointer shadow-sm text-center"
              >
                {isPending ? "Posting Note..." : "Post Note"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="py-10 text-center text-slate-500 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200 px-4">
          <span className="text-xl mb-1 block">📝</span>
          <p className="font-medium text-slate-700">No progress notes yet</p>
          <p className="text-slate-400 mt-0.5">
            {isOwner
              ? "Use the box above to log your first update or milestone."
              : "The author has not posted any notes for this idea yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => {
            const authorName =
              note.profiles?.display_name ||
              note.profiles?.email?.split("@")[0] ||
              "Author";

            const formattedDate = new Date(note.created_at).toLocaleString(
              undefined,
              {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              }
            );

            return (
              <div
                key={note.id}
                className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-slate-800">
                      {authorName}
                    </span>
                    <span>&bull;</span>
                    <span className="text-slate-400">{formattedDate}</span>
                  </div>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={deletingId === note.id}
                      className="text-slate-400 hover:text-red-600 transition text-[11px] cursor-pointer ml-2"
                    >
                      {deletingId === note.id ? "Deleting..." : "Delete"}
                    </button>
                  )}
                </div>

                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed break-words">
                  {note.note}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
