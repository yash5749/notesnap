import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDocument } from "../api/document.api";

export function useDeleteDocument(subjectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId),

    onSuccess: () => {
      // 🔥 refresh documents list for this subject
      queryClient.invalidateQueries({
        queryKey: ["documents", subjectId],
      });
    },
  });
}
