export default function EmptyState({
  message = "Nothing to show",
}: {
  message?: string;
}) {
  return (
    <div className="py-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}
