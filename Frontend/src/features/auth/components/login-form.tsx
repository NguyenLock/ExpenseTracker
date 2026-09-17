"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useLogin } from "../hooks/use-login";
import { loginSchema, type LoginFormValues } from "../schemas/login-schema";

export function LoginForm() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values);
  });

  const errorMessage =
    login.error instanceof ApiError
      ? login.error.message
      : login.error
        ? "Unable to sign in"
        : null;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-label-lg text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={cn(
            "h-button-md rounded-lg border border-black/10 bg-surface px-3 text-input-value text-foreground outline-none",
            "placeholder:text-input-placeholder focus:border-primary focus:ring-2 focus:ring-primary/20",
          )}
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-error">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-label-lg text-foreground">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={cn(
            "h-button-md rounded-lg border border-black/10 bg-surface px-3 text-input-value text-foreground outline-none",
            "placeholder:text-input-placeholder focus:border-primary focus:ring-2 focus:ring-primary/20",
          )}
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-error">{errors.password.message}</p>
        ) : null}
      </div>

      {errorMessage ? <p className="text-error">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={login.isPending}
        className={cn(
          "h-button-md rounded-lg bg-primary text-button-md text-white transition-opacity",
          "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {login.isPending ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-body-sm text-muted">
        No account?{" "}
        <Link href="/register" className="font-medium text-primary">
          Create one
        </Link>
      </p>
    </form>
  );
}
