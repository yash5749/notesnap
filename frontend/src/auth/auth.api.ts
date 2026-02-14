import { apiClient } from "../api/client";

type LoginPayload = {
  email: string;
  password: string;
};

export async function login(payload: LoginPayload) {
  const res = await apiClient.post("/auth/login", payload);

  const data = res.data?.data;
  if (!data?.token) {
    throw new Error("Invalid login response");
  }

  return {
    token: data.token as string,
    user: data.user ?? null,
  };
}
