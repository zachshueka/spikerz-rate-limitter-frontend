import type { RateUpdateDto } from "../shared/types";
import { StatusBadge } from "./StatusBadge";
import { formatRelativeTime } from "../shared/utilities";

type UserRealTimeFeedProps = {
	selectedUserId: string | null;
	isLoading: boolean;
	history: RateUpdateDto[];
	now: number;
};

export const UserRealTimeFeed = ({
	selectedUserId,
	isLoading,
	history,
	now,
}: UserRealTimeFeedProps) => {
	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
				Real-Time Feed
			</h3>
			<div className="max-h-72 space-y-3 overflow-y-auto pr-2 scrollbar-thin">
				{selectedUserId && isLoading ? (
					<div className="space-y-2">
						<div className="h-10 w-full animate-pulse rounded-xl bg-slate-900" />
						<div className="h-10 w-full animate-pulse rounded-xl bg-slate-900" />
						<div className="h-10 w-full animate-pulse rounded-xl bg-slate-900" />
					</div>
				) : selectedUserId && history.length > 0 ? (
					history.map((entry) => (
						<div
							key={`${entry.userId}-${entry.lastRequestTimestamp}`}
							className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3"
						>
							<div>
								<p className="text-sm font-medium text-slate-100">
									{entry.totalRequestsAllowed - entry.remainingRequestsCount} /{" "}
									{entry.totalRequestsAllowed} used
								</p>
								<p className="text-xs text-slate-400">
									{formatRelativeTime(entry.lastRequestTimestamp, now)}
								</p>
							</div>
							<StatusBadge status={entry.rateLimitStatus} />
						</div>
					))
				) : (
					<div className="rounded-xl border border-dashed border-slate-800 px-4 py-6 text-sm text-slate-500">
						{selectedUserId
							? "No request history available yet."
							: "Select a user to view request history."}
					</div>
				)}
			</div>
		</div>
	);
};
