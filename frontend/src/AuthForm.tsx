import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "./api";

type Credentials = { email: string; password: string };
export function AuthForm({ onAuthenticated }: { onAuthenticated: () => void }) {
  const { register, handleSubmit } = useForm<Credentials>();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const submit = handleSubmit(async (values) => {
    try {
      await api(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(values),
      });
      onAuthenticated();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to authenticate",
      );
    }
  });
  return (
    <form onSubmit={submit} className="card">
      <h2>{mode === "login" ? "Welcome back" : "Create an account"}</h2>
      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          {...register("email", { required: true })}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          minLength={12}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          {...register("password", { required: true })}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Continue</button>
      <button
        type="button"
        className="link"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "Create account" : "Use existing account"}
      </button>
    </form>
  );
}
