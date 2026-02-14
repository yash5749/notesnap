import { useUploadDocumentByType } from "../../hooks/useUploadDocumentByType";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useRef } from "react";

const TYPES = [
  { key: "syllabus", label: "Syllabus" },
  { key: "notes", label: "Notes" },
  { key: "pyq", label: "Previous Year Questions" },
  { key: "textbook", label: "Textbook" },
] as const;

export default function UploadDocumentByType({
  subjectId,
}: {
  subjectId: string;
}) {
  const { mutate, isPending } = useUploadDocumentByType();

  const handleUpload = (
    file: File,
    type: "syllabus" | "notes" | "pyq" | "textbook"
  ) => {
    mutate({ file, subjectId, type });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {TYPES.map((t) => {
          const inputRef = useRef<HTMLInputElement>(null);

          return (
            <div
              key={t.key}
              className="flex items-center justify-between border rounded-md p-3"
            >
              <div>
                <p className="font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">
                  Upload {t.label.toLowerCase()} document
                </p>
              </div>

              <>
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  disabled={isPending}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    handleUpload(file, t.key);
                    e.currentTarget.value = "";
                  }}
                />

                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => inputRef.current?.click()}
                >
                  Upload
                </Button>
              </>
            </div>
          );
        })}

        {isPending && (
          <p className="text-xs text-muted-foreground">
            Uploading document…
          </p>
        )}
      </CardContent>
    </Card>
  );
}
