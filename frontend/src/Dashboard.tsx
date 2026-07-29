import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { Icon } from "./Icon";
import type { Resume } from "./types";

export function withoutResume(resumes: Resume[], resumeId: string): Resume[] {
  return resumes.filter((resume) => resume.id !== resumeId);
}

export function Dashboard({ onEdit }: { onEdit: (resume: Resume) => void }) {
  const cache = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const resumes = useQuery({
    queryKey: ["resumes"],
    queryFn: () => api<Resume[]>("/resumes"),
  });
  async function create() {
    const resume = await api<Resume>("/resumes", {
      method: "POST",
      body: JSON.stringify({}),
    });
    await cache.invalidateQueries({ queryKey: ["resumes"] });
    onEdit(resume);
  }
  async function deleteResume(resume: Resume) {
    if (
      !window.confirm(`Delete “${resume.title}”? This action cannot be undone.`)
    )
      return;

    setDeleteError("");
    setDeletingId(resume.id);
    try {
      await api<void>(`/resumes/${resume.id}`, { method: "DELETE" });
      cache.setQueryData<Resume[]>(["resumes"], (current) =>
        current ? withoutResume(current, resume.id) : current,
      );
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : "Unable to delete résumé",
      );
    } finally {
      setDeletingId(null);
    }
  }
  return (
    <section>
      <div className="toolbar">
        <h2>Your résumés</h2>
        <button onClick={create}>
          <Icon name="plus" />
          New résumé
        </button>
      </div>
      {resumes.isLoading && <p>Loading…</p>}
      {deleteError && <p role="alert">{deleteError}</p>}
      <div className="grid">
        {resumes.data?.map((resume) => (
          <article className="resume-card" key={resume.id}>
            <button
              className="resume-card-open"
              disabled={deletingId === resume.id}
              onClick={() => onEdit(resume)}
            >
              <Icon name="edit" />
              <strong>{resume.title}</strong>
              <span>Saved {new Date(resume.updated_at).toLocaleString()}</span>
            </button>
            <button
              className="delete-resume-button"
              disabled={deletingId === resume.id}
              onClick={() => deleteResume(resume)}
            >
              <Icon name="trash" />
              {deletingId === resume.id ? "Deleting…" : "Delete"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
