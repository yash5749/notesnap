import { useQuery } from "@tanstack/react-query";
import { getDocumentsBySubject } from "../api/document.api";

export function useDocuments(subjectId?: string) {
  return useQuery({
    queryKey: ["documents", subjectId],
    queryFn: () => getDocumentsBySubject(subjectId!),
    enabled: !!subjectId,
  });
}
