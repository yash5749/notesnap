
import { useState } from "react";
import { useQuickPredict } from "../hooks/useQuickPredict";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import SubjectSelector from "../components/common/SubjectSelector";




export default function QuickPredict() {
  const [subjectId, setSubjectId] = useState<string>();
  const [topic, setTopic] = useState("");

  const { mutate, data, isPending, isError, error } = useQuickPredict();

  const handleSubmit = () => {
    if (!subjectId || !topic) return;

    mutate({ subjectId, topic });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Quick Predict</h1>
        <p className="text-muted-foreground text-sm">
          Get fast predictions based on previous patterns
        </p>
      </div>

      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle>Prediction Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SubjectSelector
            value={subjectId}
          onChange={setSubjectId}
          />

          <Input
            placeholder="Topic (e.g. JSON Web Token)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Predicting..." : "Predict"}
          </Button>
        </CardContent>
      </Card>

      {/* Error */}
      {isError && (
        <Card className="border-red-500">
          <CardContent className="text-red-600 text-sm p-4">
            {(error as Error).message}
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {data && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Prediction Result</CardTitle>
            <Badge variant="secondary">{data.confidence}</Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Predicted Questions */}
            <div>
              <h3 className="font-medium mb-2">Predicted Questions</h3>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-3 rounded">
                {data.predictedQuestions}
              </pre>
            </div>

            {/* Similar Past Questions */}
            {data.similarPastQuestions.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">
                  Similar Past Questions
                </h3>
                <ul className="space-y-2 text-sm">
                  {data.similarPastQuestions.map((q :any, idx:any) => (
                    <li
                      key={idx}
                      className="p-2 border rounded bg-background"
                    >
                      {q.content}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
