import { useEffect, useState } from "react";
import { AuthForm } from "./AuthForm";
import { Dashboard } from "./Dashboard";
import type { Resume } from "./types";
import { Editor } from "./Editor";
import { Icon } from "./Icon";

type Theme = "light" | "dark";

function initialTheme(): Theme {
  const saved = localStorage.getItem("persona-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [selected, setSelected] = useState<Resume | null>(null);
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("persona-theme", theme);
  }, [theme]);

  const nextTheme = theme === "light" ? "dark" : "light";

  return (
    <main>
      <header className="app-header">
        <div>
          <h1>Persona</h1>
          <p>Build a résumé that sounds like you.</p>
        </div>
        <button
          className="theme-toggle"
          type="button"
          aria-label={`Switch to ${nextTheme} theme`}
          aria-pressed={theme === "dark"}
          onClick={() => setTheme(nextTheme)}
        >
          <Icon name={nextTheme === "dark" ? "moon" : "sun"} />
          {nextTheme === "dark" ? "Dark mode" : "Light mode"}
        </button>
      </header>
      {authenticated ? (
        selected ? (
          <Editor initial={selected} onClose={() => setSelected(null)} />
        ) : (
          <Dashboard onEdit={setSelected} />
        )
      ) : (
        <AuthForm onAuthenticated={() => setAuthenticated(true)} />
      )}
    </main>
  );
}
