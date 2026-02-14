import { z } from "zod";

export const AnalysisResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  summary: z.string().optional(),
  sections: z
    .array(
      z.object({
        key: z.string(),
        title: z.string(),
        content: z.unknown(),
      })
    )
    .default([]),
  meta: z.object({
    subject: z.string(),
    createdAt: z.string(),
    engineVersion: z.string().optional(),
  }),
});
