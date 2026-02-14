import { apiClient } from "./client";

export async function getSubjects() {
  const res = await apiClient.get("/subjects", {
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });
  return res.data.data.subjects.map((s: any) => ({
    id: s._id,
    name: s.name,
  }));
}


export async function createSubject(payload: {
  name: string;
  description?: string;
  syllabus?: string;
}) {
  const res = await apiClient.post("/subjects", payload);
  return res.data.data.subject;
}
