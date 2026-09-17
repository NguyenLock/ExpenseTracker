"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { registerUser } from "../api/auth-api";
import type { RegisterFormValues } from "../schemas/register-schema";

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterFormValues) => registerUser(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.push("/");
    },
  });
}
