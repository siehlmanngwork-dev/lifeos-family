import { formatLongDate } from '../../utils/date';

function salutation(now: Date): string {
  const hour = now.getHours();
  if (hour < 11) return 'Guten Morgen';
  if (hour < 18) return 'Guten Tag';
  return 'Guten Abend';
}

export function Greeting({ name, now }: { name: string; now: Date }) {
  const firstName = name.split(' ')[0];
  return (
    <header className="greeting">
      <h1>
        {salutation(now)} {firstName}
      </h1>
      <p className="muted">{formatLongDate(now)}</p>
    </header>
  );
}
