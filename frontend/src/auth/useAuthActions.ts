import { useMutation } from "@tanstack/react-query";
import { login } from "./auth.api";
import { useAuth } from "./AuthContext";

export function useLogin() {
  const { login: saveAuth } = useAuth();

  return useMutation({
    mutationFn: login,
    onSuccess: ({ token, user }) => {
      saveAuth(token, user);
    },
  });
}
