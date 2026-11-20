"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signInAction } from "@/app/_lib/action";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="bg-accent-500 px-8 py-4 text-primary-800 font-semibold disabled:opacity-50"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(signInAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4 w-80">
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="px-5 py-3 bg-primary-200 text-primary-800"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        className="px-5 py-3 bg-primary-200 text-primary-800"
      />
      {state?.error && <p className="text-red-400">{state.error}</p>}
      <Submit />
    </form>
  );
}
