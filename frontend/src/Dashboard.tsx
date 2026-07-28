import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Resume } from "./types";

export function Dashboard({ onEdit }: { onEdit: (resume: Resume) => void }) {
  const cache = useQueryClient();
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
  return (
    <section>
      <div className="toolbar">
        <h2>Your résumés</h2>
        <button onClick={create}>New résumé</button>
      </div>
      {resumes.isLoading && <p>Loading…</p>}
      <div className="grid">
        {resumes.data?.map((resume) => (
          <button
            className="resume-card"
            key={resume.id}
            onClick={() => onEdit(resume)}
          >
            <strong>{resume.title}</strong>
            <span>Saved {new Date(resume.updated_at).toLocaleString()}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
