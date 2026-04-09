import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  desc?: string;
  action?: string;
  actionHref?: string;
}

export default function EmptyState({ icon = '📭', title, desc, action, actionHref }: EmptyStateProps) {
  return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      background: 'var(--esl-bg-section)',
      borderRadius: 12, border: '1px solid var(--esl-border)',
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--esl-text-primary)', marginBottom: 6 }}>{title}</p>
      {desc && <p style={{ fontSize: 13, color: 'var(--esl-text-muted)', marginBottom: action ? 16 : 0 }}>{desc}</p>}
      {action && actionHref && (
        <Link href={actionHref} style={{
          display: 'inline-block', padding: '8px 20px',
          background: '#E8242C', color: '#fff',
          borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
        }}>
          {action}
        </Link>
      )}
    </div>
  );
}
