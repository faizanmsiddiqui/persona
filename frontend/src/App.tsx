import { useState } from "react";
import { AuthForm } from "./AuthForm";
export function App() {
  const [authenticated, setAuthenticated] = useState(false);
  return (
    <main>
      <header>
        <h1>Persona</h1>
        <p>Build a résumé that sounds like you.</p>
      </header>
      {authenticated ? (
        <p>Signed in.</p>
      ) : (
        <AuthForm onAuthenticated={() => setAuthenticated(true)} />
      )}
    </main>
  );
}
