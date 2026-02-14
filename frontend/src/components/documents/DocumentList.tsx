import { useDocuments } from "../../hooks/useDocuments";
import { useDeleteDocument } from "../../hooks/useDeleteDocument";

import EmptyState from "../common/EmptyState";
import ErrorState from "../common/ErrorState";
import Loader from "../common/Loader";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export default function DocumentList({
  subjectId,
}: {
  subjectId?: string;
}) {
  const { data, isLoading, isError } = useDocuments(subjectId);
  const { mutate: deleteDoc, isPending } = useDeleteDocument(subjectId!);

  if (!subjectId) {
    return (
      <div className="text-sm text-muted-foreground">
        Select a subject to see documents
      </div>
    );
  }

  if (isLoading) {
    return <Loader text="Loading documents..." />;
  }

  if (isError) {
    return <ErrorState message="Failed to load documents" />;
  }

  if (!data || data.length === 0) {
    return <EmptyState message="No documents uploaded for this subject" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Documents</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        {data.map((doc: any) => (
          <div
            key={doc.id}
            className="flex justify-between items-center border-b py-2 text-sm"
          >
            {/* LEFT */}
            <div>
              <p className="font-medium">{doc.name}</p>
              <p className="text-muted-foreground">
                {doc.type} · {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
              {doc.status && (
                <p className="text-xs text-muted-foreground">
                  Status: {doc.status}
                </p>
              )}
            </div>

            {/* RIGHT */}
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={() => {
                if (!confirm("Delete this document permanently?")) return;
                deleteDoc(doc.id);
              }}
            >
              Delete
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
