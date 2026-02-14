export type AnalysisStatus =
  | "pending"
  | "completed"
  | "partial"
  | "failed"
  | "unknown";

export interface AnalysisSection {
  key: string;           // backend-independent
  title: string;
  content: unknown;      // UI decides how to render
}

// src/types/analysis.ts
export interface AnalysisResult {
  id: string;
  status: "processing" | "completed" | "failed";
  summary?: any;
  importantTopics: any[];
  generatedQuestions: any[];
  metadata?: any;
  cached?: boolean;
}

