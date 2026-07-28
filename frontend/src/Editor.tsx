import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";
import type { Resume } from "./types";
import { Preview } from "./Preview";
import { SectionEditor } from "./SectionEditor";

export const AUTO_SAVE_DELAY_MS = 3 * 60 * 1000;

type SaveState = "idle" | "saving" | "conflict" | "error";

export function Editor({
  initial,
  onClose,
}: {
  initial: Resume;
  onClose: () => void;
}) {
  const [resume, setResume] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [state, setState] = useState<SaveState>("idle");
  const editSequence = useRef(0);

  function updateResume(update: (current: Resume) => Resume) {
    editSequence.current += 1;
    setResume(update);
    setDirty(true);
    if (state === "conflict" || state === "error") setState("idle");
  }

  const saveResume = useCallback(async (): Promise<boolean> => {
    if (!dirty || state === "saving") return state !== "conflict";

    const snapshot = resume;
    const sequenceAtSave = editSequence.current;
    setState("saving");
    try {
      const saved = await api<Resume>(`/resumes/${snapshot.id}`, {
        method: "PATCH",
        headers: { "If-Match": `"${snapshot.updated_at}"` },
        body: JSON.stringify({
          title: snapshot.title,
          document: snapshot.document,
          updated_at: snapshot.updated_at,
        }),
      });
      setResume((current) => {
        if (editSequence.current === sequenceAtSave) {
          setDirty(false);
          return saved;
        }
        return { ...current, updated_at: saved.updated_at };
      });
      setState("idle");
      return true;
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "";
      setState(message.includes("another session") ? "conflict" : "error");
      return false;
    }
  }, [dirty, resume, state]);

  useEffect(() => {
    if (!dirty || state === "saving") return;
    const timer = window.setTimeout(
      () => void saveResume(),
      AUTO_SAVE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [dirty, saveResume, state]);

  async function downloadPdf() {
    if (!(await saveResume())) return;
    const csrf = decodeURIComponent(
      document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] ?? "",
    );
    const response = await fetch(`/api/v1/resumes/${resume.id}/pdf`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRF-Token": csrf },
    });
    if (!response.ok) {
      setState("error");
      return;
    }
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = url;
    link.download = "resume.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }

  const basics = resume.document.basics;
  function basic(
    name: "name" | "headline" | "email" | "phone" | "location" | "summary",
    value: string,
  ) {
    updateResume((current) => ({
      ...current,
      document: {
        ...current.document,
        basics: { ...current.document.basics, [name]: value },
      },
    }));
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= resume.document.sections.length) return;
    updateResume((current) => {
      const sections = [...current.document.sections];
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return {
        ...current,
        document: {
          ...current.document,
          sections: sections.map((section, order) => ({ ...section, order })),
        },
      };
    });
  }

  return (
    <section>
      <div className="toolbar editor-toolbar">
        <button className="link" onClick={onClose}>
          ← Dashboard
        </button>
        <div className="editor-actions">
          <button
            disabled={!dirty || state === "saving"}
            onClick={() => void saveResume()}
          >
            {state === "saving" ? "Saving…" : "Save"}
          </button>
          <button
            disabled={state === "saving"}
            onClick={() => void downloadPdf()}
          >
            Download PDF
          </button>
        </div>
      </div>
      {state === "conflict" && (
        <p role="alert">
          This résumé changed in another session. Return to the dashboard and
          reopen it before saving.
        </p>
      )}
      {state === "error" && (
        <p role="alert">The résumé could not be saved. Please try again.</p>
      )}
      <div className="editor">
        <form className="card resume-form">
          <label>
            Document title
            <input
              value={resume.title}
              onChange={(event) =>
                updateResume((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
          </label>
          <label>
            Name
            <input
              value={basics.name}
              onChange={(event) => basic("name", event.target.value)}
            />
          </label>
          <label>
            Headline
            <input
              value={basics.headline}
              onChange={(event) => basic("headline", event.target.value)}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={basics.email ?? ""}
              onChange={(event) => basic("email", event.target.value)}
            />
          </label>
          <label>
            Phone
            <input
              type="tel"
              value={basics.phone}
              onChange={(event) => basic("phone", event.target.value)}
            />
          </label>
          <label>
            Location
            <input
              value={basics.location}
              onChange={(event) => basic("location", event.target.value)}
            />
          </label>
          <label>
            Summary
            <textarea
              rows={7}
              value={basics.summary}
              onChange={(event) => basic("summary", event.target.value)}
            />
          </label>
          <label>
            Accent
            <input
              type="color"
              value={resume.document.presentation.accent}
              onChange={(event) =>
                updateResume((current) => ({
                  ...current,
                  document: {
                    ...current.document,
                    presentation: {
                      ...current.document.presentation,
                      accent: event.target.value,
                    },
                  },
                }))
              }
            />
          </label>
          <SectionEditor
            sections={resume.document.sections}
            onMove={moveSection}
            onChange={(sections) =>
              updateResume((current) => ({
                ...current,
                document: { ...current.document, sections },
              }))
            }
          />
        </form>
        <Preview document={resume.document} />
      </div>
    </section>
  );
}
