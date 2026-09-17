"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { registerUser } from "../api/auth-api";
import type { RegisterFormValues } from "../schemas/register-schema";

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterFormValues) => registerUser(data),
    onSuccess: () => {
      router.push("/");
    },
  });
}
