import { useEffect, useState } from "react";
import { api } from "./api";
import type { Resume } from "./types";
import { Preview } from "./Preview";

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
  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= resume.document.sections.length) return;
    const sections = [...resume.document.sections];
    [sections[index], sections[target]] = [sections[target], sections[index]];
    sections.forEach((section, order) => (section.order = order));
    setResume({ ...resume, document: { ...resume.document, sections } });
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
          <label>
            Template
            <select
              value={resume.document.presentation.template}
              onChange={(e) =>
                setResume({
                  ...resume,
                  document: {
                    ...resume.document,
                    presentation: {
                      ...resume.document.presentation,
                      template: e.target.value as "modern" | "classic",
                    },
                  },
                })
              }
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
            </select>
          </label>
          <label>
            Accent
            <input
              type="color"
              value={resume.document.presentation.accent}
              onChange={(e) =>
                setResume({
                  ...resume,
                  document: {
                    ...resume.document,
                    presentation: {
                      ...resume.document.presentation,
                      accent: e.target.value,
                    },
                  },
                })
              }
            />
          </label>
          {resume.document.sections.map((section, index) => (
            <div className="section-row" key={section.id}>
              <span>{section.title}</span>
              <button type="button" onClick={() => moveSection(index, -1)}>
                ↑
              </button>
              <button type="button" onClick={() => moveSection(index, 1)}>
                ↓
              </button>
            </div>
          ))}
        </form>
        <Preview document={resume.document} />
      </div>
    </section>
  );
}
