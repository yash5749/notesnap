import { apiClient } from "./client";

/**
 * Raw backend response is noisy.
 * We normalize it here and NEVER leak backend shape to UI.
 */
export async function quickPredict(payload: {
  subjectId: string;
  topic: string;
}) {
  const res = await apiClient.post("/analysis/quick-predict", payload);

  const data = res.data?.data;

  if (!data) {
    throw new Error("Invalid quick predict response");
  }

  return {
    topic: data.topic,
    predictedQuestions: data.predictedQuestions,
    confidence: data.confidence,
    similarPastQuestions: data.similarPastQuestions ?? [],
    modelUsed: data.modelUsed,
    cached: data.cached,
    generatedAt: data.generatedAt,
  };
}
