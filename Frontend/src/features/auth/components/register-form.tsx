"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useRegister } from "../hooks/use-register";
import {
  registerSchema,
  type RegisterFormValues,
} from "../schemas/register-schema";

export function RegisterForm() {
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    registerMutation.mutate(values);
  });

  const errorMessage =
    registerMutation.error instanceof ApiError
      ? registerMutation.error.message
      : registerMutation.error
        ? "Unable to create account"
        : null;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-label-lg text-foreground">
          Name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          className={cn(
            "h-button-md rounded-lg border border-black/10 bg-surface px-3 text-input-value text-foreground outline-none",
            "placeholder:text-input-placeholder focus:border-primary focus:ring-2 focus:ring-primary/20",
          )}
          placeholder="Your name"
          {...register("name")}
        />
        {errors.name ? <p className="text-error">{errors.name.message}</p> : null}
      </div>

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
          autoComplete="new-password"
          className={cn(
            "h-button-md rounded-lg border border-black/10 bg-surface px-3 text-input-value text-foreground outline-none",
            "placeholder:text-input-placeholder focus:border-primary focus:ring-2 focus:ring-primary/20",
          )}
          placeholder="At least 8 characters"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-error">{errors.password.message}</p>
        ) : null}
      </div>

      {errorMessage ? <p className="text-error">{errorMessage}</p> : null}

      <button
        type="submit"
        disabled={registerMutation.isPending}
        className={cn(
          "h-button-md rounded-lg bg-primary text-button-md text-white transition-opacity",
          "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {registerMutation.isPending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-body-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary">
          Sign in
        </Link>
      </p>
    </form>
  );
}
