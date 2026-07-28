import { useEffect, useState } from "react";
import { api } from "./api";
import type { Resume } from "./types";

export function Editor({
  initial,
  onClose,
}: {
  initial: Resume;
  onClose: () => void;
}) {
  const [resume, setResume] = useState(initial);
  const [state, setState] = useState<"saved" | "saving" | "conflict">("saved");
  useEffect(() => {
    if (resume === initial) return;
    const timer = window.setTimeout(async () => {
      setState("saving");
      try {
        const saved = await api<Resume>(`/resumes/${resume.id}`, {
          method: "PATCH",
          headers: { "If-Match": `"${resume.version}"` },
          body: JSON.stringify({
            title: resume.title,
            document: resume.document,
            version: resume.version,
          }),
        });
        setResume(saved);
        setState("saved");
      } catch {
        setState("conflict");
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [resume, initial]);
  const basics = resume.document.basics;
  function basic(name: keyof typeof basics, value: string) {
    setResume({
      ...resume,
      document: { ...resume.document, basics: { ...basics, [name]: value } },
    });
  }
  return (
    <section>
      <div className="toolbar">
        <button className="link" onClick={onClose}>
          ← Dashboard
        </button>
        <span aria-live="polite">{state}</span>
      </div>
      <div className="editor">
        <form className="card">
          <label>
            Document title
            <input
              value={resume.title}
              onChange={(e) => setResume({ ...resume, title: e.target.value })}
            />
          </label>
          <label>
            Name
            <input
              value={basics.name}
              onChange={(e) => basic("name", e.target.value)}
            />
          </label>
          <label>
            Headline
            <input
              value={basics.headline}
              onChange={(e) => basic("headline", e.target.value)}
            />
          </label>
          <label>
            Summary
            <textarea
              rows={7}
              value={basics.summary}
              onChange={(e) => basic("summary", e.target.value)}
            />
          </label>
        </form>
        <article className="preview">
          <h2>{basics.name || "Your name"}</h2>
          <h3>{basics.headline}</h3>
          <p>{basics.summary}</p>
        </article>
      </div>
    </section>
  );
}
