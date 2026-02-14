import type { AnalysisResult } from "../types/analysis";
import { apiClient } from "./client";

/**
 * Starts analysis and returns ONLY the analysisId.
 * Everything else is ignored.
 */
export async function startSubjectAnalysis(payload: {
  subjectId: string;
}) {
  const res = await apiClient.post("/analysis/subject", payload);

  const data = res.data?.data;
  if (!data?.analysisId) {
    throw new Error("Invalid analysis start response");
  }

  return {
    analysisId: data.analysisId as string,
    estimatedTime: data.estimatedTime as string | undefined,
  };
}

/**
 * Fetch analysis result by ID
 */
export async function getAnalysisResult(
  analysisId: string
): Promise<AnalysisResult> {
  const res = await apiClient.get(`/analysis/${analysisId}`);

  const a = res.data.data.analysis;

  return {
    id: a._id,
    status: a.status,
    summary: a.summary,
    importantTopics: a.importantTopics ?? [],
    generatedQuestions: a.generatedQuestions ?? [],
    metadata: a.metadata,
    cached: res.data.data.cached,
  };
}

