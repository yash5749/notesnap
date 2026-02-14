import { Card, CardContent, CardHeader } from "../ui/card";

export default function AnalysisSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="h-4 w-1/3 bg-muted rounded" />
        <div className="h-4 w-1/2 bg-muted rounded" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-5/6 bg-muted rounded" />
        <div className="h-3 w-4/6 bg-muted rounded" />
      </CardContent>
    </Card>
  );
}
