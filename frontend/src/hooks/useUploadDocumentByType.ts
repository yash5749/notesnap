import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadDocumentByType } from "../api/document.api";

export function useUploadDocumentByType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      subjectId,
      type,
    }: {
      file: File;
      subjectId: string;
      type: "syllabus" | "notes" | "pyq" | "textbook";
    }) => uploadDocumentByType(file, subjectId, type),

    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", vars.subjectId],
      });
    },
  });
}
