export default function Loader({
  text = "Loading...",
}: {
  text?: string;
}) {
  return (
    <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
