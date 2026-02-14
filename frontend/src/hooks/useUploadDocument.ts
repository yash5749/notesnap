import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadDocument } from "../api/document.api";

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      subjectId,
    }: {
      file: File;
      subjectId: string;
    }) => uploadDocument(file, subjectId),

    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["documents", vars.subjectId],
      });
    },
  });
}
