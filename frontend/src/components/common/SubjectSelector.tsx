import { useSubjects } from "../../hooks/useSubjects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Loader from "../common/Loader";
import ErrorState from "../common/ErrorState";

type Props = {
  value?: string;
  onChange: (subjectId: string) => void;
};

export default function SubjectSelector({ value, onChange }: Props) {
  const { data, isLoading, isError } = useSubjects();

  /* ---------- Loading ---------- */
  if (isLoading) {
    return <Loader text="Loading subjects..." />;
  }

  /* ---------- Error ---------- */
  if (isError || !data) {
    return <ErrorState message="Failed to load subjects" />;
  }

  return (
    <Select
      value={value ?? ""}   // ✅ CRITICAL FIX
      onValueChange={onChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select subject" />
      </SelectTrigger>

      <SelectContent>
        {data.map((s: { id: string; name: string }) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
