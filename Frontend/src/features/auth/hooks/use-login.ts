"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { loginUser } from "../api/auth-api";
import type { LoginFormValues } from "../schemas/login-schema";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginFormValues) => loginUser(data),
    onSuccess: () => {
      router.push("/");
    },
  });
}
