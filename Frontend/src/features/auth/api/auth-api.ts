import { apiClient } from "@/lib/api-client";
import type { AuthResponseType, UserType } from "../types/auth-types";
import type { LoginFormValues } from "../schemas/login-schema";
import type { RegisterFormValues } from "../schemas/register-schema";

export function registerUser(data: RegisterFormValues) {
  return apiClient<AuthResponseType>("/auth/register", {
    method: "POST",
    body: data,
    auth: false,
  });
}

export function loginUser(data: LoginFormValues) {
  return apiClient<AuthResponseType>("/auth/login", {
    method: "POST",
    body: data,
    auth: false,
  });
}

export function refreshSession() {
  return apiClient<AuthResponseType>("/auth/refresh", {
    method: "POST",
    skipRefresh: true,
  });
}

export function logoutUser() {
  return apiClient<{ ok: boolean }>("/auth/logout", {
    method: "POST",
    skipRefresh: true,
  });
}

export function getCurrentUser() {
  return apiClient<UserType>("/users/me");
}
