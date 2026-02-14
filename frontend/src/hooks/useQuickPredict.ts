import { useMutation } from "@tanstack/react-query";
import { quickPredict } from "../api/quickPredict.api";

export function useQuickPredict() {
  return useMutation({
    mutationFn: quickPredict,
  });
}
