import { Button } from "../ui/button";

export default function ErrorState({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded border border-red-300 bg-red-50 p-4 text-sm space-y-2">
      <p className="font-medium text-red-700">{message}</p>

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
