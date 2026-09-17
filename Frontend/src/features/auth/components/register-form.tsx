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

  const fieldClass = cn(
    "h-12 rounded-2xl border-0 bg-background px-4 text-input-value text-foreground outline-none",
    "ring-1 ring-black/5 placeholder:text-input-placeholder focus:ring-2 focus:ring-primary/30",
  );

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
          className={fieldClass}
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
          className={fieldClass}
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
          className={fieldClass}
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
          "mt-1 h-12 rounded-2xl bg-primary text-button-md text-white transition-opacity",
          "hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60",
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
