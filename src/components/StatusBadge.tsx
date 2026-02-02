import type { RateLimitStatus } from "../types/rate-limit";

const STATUS_STYLES: Record<RateLimitStatus, string> = {
	OK: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
	Warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
	Exceeded: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export const StatusBadge = ({ status }: { status: RateLimitStatus }) => {
	return (
		<span
			className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[status]}`}
		>
			{status}
		</span>
	);
};
