import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  className?: string;
  accentColor?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function Card({ title, className = '', accentColor, actions, children }: CardProps) {
  return (
    <section
      className={`card ${className}`}
      style={accentColor ? { borderTopColor: accentColor } : undefined}
    >
      {(title || actions) && (
        <header className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
