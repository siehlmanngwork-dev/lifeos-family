import { useState, type ReactNode } from 'react';
import type { Family, UserProfile } from '../../models';
import { Card } from '../shared/Card';

interface FamilyOverviewProps {
  family: Family;
  members: UserProfile[];
  currentUserId: string;
  /** Short line under each name (first level, e.g. the current status). */
  renderSummary?: (member: UserProfile) => ReactNode;
  /** Details shown when a member is clicked. */
  renderDetail?: (member: UserProfile) => ReactNode;
}

export function FamilyOverview({ family, members, currentUserId, renderSummary, renderDetail }: FamilyOverviewProps) {
  const [copied, setCopied] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(family.joinCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — the code stays visible for manual copying.
    }
  };

  return (
    <div className="two-columns">
      <Card title={family.name}>
        <p className="muted">Familiencode</p>
        <div className="join-code">
          <code>{family.joinCode}</code>
          <button type="button" className="button" onClick={copyCode}>
            {copied ? 'Kopiert ✓' : 'Kopieren'}
          </button>
        </div>
        <p className="muted small">Wer diesen Code eingibt, tritt der Familie bei.</p>
      </Card>
      <Card title={`👥 Mitglieder (${members.length})`}>
        <ul className="member-list">
          {members.map((m) => (
            <li key={m.id} className="member-entry">
              <button
                type="button"
                className="member-row"
                onClick={() => setOpenId(openId === m.id ? null : m.id)}
                disabled={!renderDetail}
                aria-expanded={renderDetail ? openId === m.id : undefined}
              >
                <span className="avatar">{m.displayName.charAt(0).toUpperCase()}</span>
                <span className="member-text">
                  <span>
                    {m.displayName}
                    {m.id === currentUserId && <span className="muted"> (ich)</span>}
                    {m.id === family.createdBy && <span className="muted"> · Ersteller</span>}
                  </span>
                  {renderSummary && <span className="member-summary">{renderSummary(m)}</span>}
                </span>
              </button>
              {renderDetail && openId === m.id && <div className="member-detail">{renderDetail(m)}</div>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
