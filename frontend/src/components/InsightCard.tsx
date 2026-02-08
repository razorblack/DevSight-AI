export interface InsightCardProps {
  content: string;
  title?: string;
}

export function InsightCard({ content, title = "Insight" }: InsightCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-6">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-300">
        {title}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-slate-100">{content}</div>
    </div>
  );
}
