import { useUploadDocument } from "../../hooks/useUploadDocument";

export default function UploadDocument({
  subjectId,
}: {
  subjectId: string;
}) {
  const { mutate, isPending, isError } = useUploadDocument();

  return (
    <div className="space-y-2">
      <input
        type="file"
        disabled={isPending}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          mutate({ file, subjectId });
        }}
      />

      {isPending && (
        <p className="text-xs text-muted-foreground">
          Uploading...
        </p>
      )}

      {isError && (
        <p className="text-xs text-red-600">
          Upload failed. Try again.
        </p>
      )}
    </div>
  );
}
