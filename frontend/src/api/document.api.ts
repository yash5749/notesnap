import { apiClient } from "./client";

/* ============================
   FETCH DOCUMENTS BY SUBJECT
   ============================ */
export async function getDocumentsBySubject(subjectId: string) {

  const res = await apiClient.get("/documents", {
    params: {subjectId,  _ts: Date.now()}
  });
  
  console.log("🔥 RESPONSE:", res.data?.data?.documents);
  
  const list = res.data?.data?.documents ?? [];

  return list.map((d: any) => ({
    id: d._id,
    name: d.originalName,
    type: d.documentType,
    uploadedAt: d.uploadedAt,
    status: d.status, // optional, if present
  }));
}

/* ============================
   UPLOAD DOCUMENT (GENERIC)
   ============================ */
export async function uploadDocument(
  file: File,
  subjectId: string
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("subjectId", subjectId);

  const res = await apiClient.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.data;
}

/* ============================
   GET DOCUMENT STATUS
   ============================ */
export async function getDocumentStatus(documentId: string) {
  const res = await apiClient.get(`/documents/${documentId}/status`);
  return res.data.data;
}

/* ============================
   DELETE DOCUMENT
   ============================ */
export async function deleteDocument(documentId: string) {
  await apiClient.delete(`/documents/${documentId}`);
}


/* ============================
   UPLOAD DOCUMENT BY TYPE
   ============================ */

export async function uploadDocumentByType(
  file: File,
  subjectId: string,
  type: "syllabus" | "notes" | "pyq" | "textbook"
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("subjectId", subjectId);

  const res = await apiClient.post(
    `/documents/upload/${type}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data.data;
}