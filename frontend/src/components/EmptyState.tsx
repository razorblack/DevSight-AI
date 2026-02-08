export interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-slate-300">{description}</p>
      ) : null}
    </div>
  );
}
