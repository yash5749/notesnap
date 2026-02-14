import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSubject } from "../api/subject.api";

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      // 🔥 refresh subject list automatically
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}
