import { useDocuments } from "../hooks/useDocuments";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";


export default function DocumentList({
  subjectId,
}: {
  subjectId?: string;
}) {
  const { data, isLoading, isError } = useDocuments(subjectId);

  if (!subjectId) {
    return (
      <div className="text-sm text-muted-foreground">
        Select a subject to see documents
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-sm">Loading documents...</div>;
  }

  if (isError) {
    return <div className="text-sm text-red-600">Failed to load documents</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No documents uploaded for this subject
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.map((doc:any) => (
          <div
            key={doc.id}
            className="flex justify-between items-center border-b py-2 text-sm"
          >
            <div>
              <p className="font-medium">{doc.name}</p>
              <p className="text-muted-foreground">
                {doc.type} ·{" "}
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
