import { useQuery } from "@tanstack/react-query";
import { getAnalysisResult } from "../api/analysis.api";
import type { AnalysisResult } from "../types/analysis";


export function useAnalysisResult(analysisId: string) {
  return useQuery<AnalysisResult>({
    queryKey: ["analysis", analysisId],
    queryFn: () => getAnalysisResult(analysisId),
    enabled: !!analysisId,
    retry: false,
    refetchOnWindowFocus: false,

    refetchInterval: (query) => {
      const data = query.state.data as AnalysisResult | undefined;
      return data?.status === "processing" ? 5000 : false;
    },
  });
}
