import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useAnalysisResult } from "../hooks/useAnalysisResult";
import AnalysisSkeleton from "../components/analysis/AnalysisSkeleton";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

/* ======================
   Processing Banner
   ====================== */
function ProcessingBanner({
  status,
  estimatedTime,
}: {
  status: string;
  estimatedTime?: string;
}) {
  if (status !== "processing") return null;

  return (
    <div className="mb-4 rounded border border-yellow-300 bg-yellow-50 p-4 text-sm">
      <p className="font-medium">Analysis in progress</p>
      <p className="text-muted-foreground">
        This may take {estimatedTime ?? "a few minutes"}. You can stay on this
        page.
      </p>
    </div>
  );
}

/* ======================
   Page
   ====================== */
export default function AnalysisResult() {
  const { analysisId } = useParams<{ analysisId: string }>();

  if (!analysisId) {
    return <div className="p-6">Invalid analysis ID</div>;
  }

  const { data, isLoading, isError } = useAnalysisResult(analysisId);

  /* ---------- Loading ---------- */
  if (isLoading) {
    return <AnalysisSkeleton />;
  }

  /* ---------- Error ---------- */
  if (isError) {
    return <ErrorState message="Failed to load analysis" />;
  }
  

  /* ---------- Empty ---------- */
  if (!data) {
    return <EmptyState message="No analysis data to show" />
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* ================= Header ================= */}
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold">Analysis Result</h1>

        {data.cached && (
          <Badge variant="secondary">Cached</Badge>
        )}
      </div>

      {/* ================= Processing Banner ================= */}
      <ProcessingBanner
        status={data.status}
        estimatedTime={data.summary?.estimatedPreparationTime}
      />

      {/* ================= Summary ================= */}
      {data.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2 text-sm">
            <p>{data.summary.overview}</p>

            <ul className="list-disc pl-5">
              {data.summary.studyRecommendations.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>

            <p className="text-muted-foreground">
              Estimated prep time:{" "}
              {data.summary.estimatedPreparationTime}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ================= Important Topics ================= */}
      {data.importantTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Important Topics</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2 text-sm">
            {data.importantTopics.map((t: any, i: number) => (
              <div key={i} className="flex justify-between border-b py-1">
                <span>{t.topic}</span>
                <span className="text-muted-foreground">
                  {t.priority} · {Math.round(t.confidence * 100)}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ================= Generated Questions ================= */}
      {data.generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Questions</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            {data.generatedQuestions.map((q: any) => (
              <div key={q.id} className="border rounded p-3">
                <p className="font-medium">{q.question}</p>
                <div className="text-muted-foreground text-xs mt-1">
                  {q.type} · {q.marks} marks · {q.estimatedTime} mins
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
