export function LoadingScreen({ label = 'Lädt …' }: { label?: string }) {
  return (
    <div className="center-screen">
      <p className="muted">{label}</p>
    </div>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="error-note" role="alert">
      {message}
    </p>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <p className="empty">{text}</p>;
}
