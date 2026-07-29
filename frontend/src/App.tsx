import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthForm } from "./AuthForm";
import { api } from "./api";
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
  const cache = useQueryClient();
  const [authenticated, setAuthenticated] = useState(false);
  const [selected, setSelected] = useState<Resume | null>(null);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("persona-theme", theme);
  }, [theme]);

  const nextTheme = theme === "light" ? "dark" : "light";

  async function logout() {
    setLogoutError("");
    setLoggingOut(true);
    try {
      await api<void>("/auth/logout", { method: "POST" });
      cache.clear();
      setSelected(null);
      setAuthenticated(false);
    } catch (reason) {
      setLogoutError(
        reason instanceof Error ? reason.message : "Unable to log out",
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main>
      <header className="app-header">
        <div>
          <h1>Persona</h1>
          <p>Build a résumé that sounds like you.</p>
        </div>
        <div className="app-header-actions">
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
          {authenticated && (
            <button
              className="logout-button"
              type="button"
              disabled={loggingOut}
              onClick={() => void logout()}
            >
              <Icon name="log-out" />
              {loggingOut ? "Logging out…" : "Logout"}
            </button>
          )}
        </div>
      </header>
      {logoutError && <p role="alert">{logoutError}</p>}
      {authenticated ? (
        selected ? (
          <Editor initial={selected} onClose={() => setSelected(null)} />
        ) : (
          <Dashboard onEdit={setSelected} />
        )
      ) : (
        <AuthForm
          onAuthenticated={() => {
            setLogoutError("");
            setAuthenticated(true);
          }}
        />
      )}
    </main>
  );
}
