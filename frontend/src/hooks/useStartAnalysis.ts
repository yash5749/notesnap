import { useMutation } from "@tanstack/react-query";
import { startSubjectAnalysis } from "../api/analysis.api";

export function useStartAnalysis() {
  return useMutation({
    mutationFn: startSubjectAnalysis,
  });
}
