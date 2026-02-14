
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useStartAnalysis } from "../hooks/useStartAnalysis";
import SubjectSelector from "../components/common/SubjectSelector";
import DocumentList from "../components/documents/DocumentList";
// import UploadDocument from "../components/documents/UploadDocument";


export default function SubjectAnalysis() {
  const [subjectId, setSubjectId] = useState<string>();
  const navigate = useNavigate();
  const { mutate, isPending } = useStartAnalysis();

  const handleSubmit = () => {
    if (!subjectId) return;

    mutate(
      { subjectId },
      {
        onSuccess: (res) => {
          navigate(`/analysis/result/${res.analysisId}`);
        },
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Subject Analysis</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <SubjectSelector
              value={subjectId}
              onChange={setSubjectId}
          />
     
          <DocumentList subjectId={subjectId!} />

          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Starting Analysis..." : "Start Analysis"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
