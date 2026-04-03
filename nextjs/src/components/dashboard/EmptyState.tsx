interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-6 flex flex-col items-center">
      <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[rgba(99,102,241,.1)] to-[rgba(139,92,246,.1)] flex items-center justify-center text-5xl mb-5 animate-float">
        {icon}
      </div>
      <h3 className="text-lg font-extrabold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/40 max-w-xs leading-relaxed mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-dash-accent text-white border-none rounded-xl px-7 py-3 text-sm font-bold cursor-pointer shadow-[0_4px_16px_rgba(99,102,241,.3)] hover:bg-[#4F46E5] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,.4)] transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
