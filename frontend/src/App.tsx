import { useState } from "react";
import { AuthForm } from "./AuthForm";
import { Dashboard } from "./Dashboard";
import type { Resume } from "./types";
import { Editor } from "./Editor";
export function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [selected, setSelected] = useState<Resume | null>(null);
  return (
    <main>
      <header>
        <h1>Persona</h1>
        <p>Build a résumé that sounds like you.</p>
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
