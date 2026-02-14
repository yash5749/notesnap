import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SubjectSelector from "../components/common/SubjectSelector";
import UploadDocumentByType from "../components/documents/UploadDocumentByType";
import CreateSubjectForm from "../components/subjects/CreateSubjectForm";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import DocumentList from "../components/documents/DocumentList";

export default function Home() {
  const [subjectId, setSubjectId] = useState<string>();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* ================= Subject ================= */}
      <div className="space-y-6">
      <CreateSubjectForm />
      {/* existing SubjectSelector + Upload + Analysis UI */}
    </div>
      <Card>
        <CardHeader>
          <CardTitle>Select Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <SubjectSelector value={subjectId} onChange={setSubjectId} />
        </CardContent>
      </Card>

      {/* ================= Upload ================= */}
      {subjectId && (
          <UploadDocumentByType subjectId={subjectId} />
      )}
      {subjectId && ( <DocumentList subjectId={subjectId!} />)}


      {/* ================= Actions ================= */}
      {subjectId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Analyze uploaded documents and generate exam-focused insights.
              </p>
              <Button
                onClick={() =>
                  navigate("/analysis/subject", {
                    state: { subjectId },
                  })
                }
              >
                Start Analysis
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Predict</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Predict possible questions from a specific topic.
              </p>
              <Button
                variant="secondary"
                onClick={() =>
                  navigate("/predict/quick", {
                    state: { subjectId },
                  })
                }
              >
                Run Quick Predict
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
