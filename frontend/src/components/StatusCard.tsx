export type StatusCardStatus = "healthy" | "degraded" | "down";

export interface StatusCardProps {
  title: string;
  status: StatusCardStatus;
  description?: string;
}

function statusColor(status: StatusCardStatus) {
  switch (status) {
    case "healthy":
      return "bg-emerald-500";
    case "degraded":
      return "bg-amber-500";
    case "down":
      return "bg-rose-500";
  }
}

export function StatusCard({ title, status, description }: StatusCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${statusColor(status)}`}
            aria-hidden
          />
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            {status}
          </span>
        </div>
      </div>

      {description ? (
        <p className="mt-2 text-sm text-slate-300">{description}</p>
      ) : null}
    </div>
  );
}
