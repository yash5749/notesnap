import { useQuery } from "@tanstack/react-query";
import { getSubjects } from "../api/subject.api";

export function useSubjects() {

  
  return useQuery({
    queryKey: ["subjects"],
    queryFn: getSubjects,
    retry: false,
    staleTime: 1000 * 60 , // 5 minutes
  });
}
