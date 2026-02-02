import { useMemo, useState } from "react";
import type { UserDataDto } from "../types/rate-limit";
import { ProgressBar } from "./ProgressBar";
import { StatusBadge } from "./StatusBadge";
import { useNow } from "../hooks/useNow";
import { formatRelativeTime } from "../utils/time";

type UserDetailsPanelProps = {
	selectedUserId: string | null;
	userData: UserDataDto | undefined;
	isLoading: boolean;
	error: Error | null;
	onResetQuota: () => void;
	onToggleSuspend: (isSuspended: boolean) => void;
	onAddExtra: (amount: number) => void;
	isMutating: boolean;
};

export const UserDetailsPanel = ({
	selectedUserId,
	userData,
	isLoading,
	error,
	onResetQuota,
	onToggleSuspend,
	onAddExtra,
	isMutating,
}: UserDetailsPanelProps) => {
	const now = useNow();
	const [addExtraAmount, setAddExtraAmount] = useState(5);

	const requestLimit =
		userData?.windowData.currentRequestLimit ??
		userData?.registryData.baseRequestLimit ??
		0;
	const requestCount = userData?.windowData.requestCount ?? 0;

	const history = useMemo(() => {
		if (!userData?.requestsHistory) {
			return [];
		}
		return [...userData.requestsHistory].sort(
			(a, b) => b.lastRequestTimestamp - a.lastRequestTimestamp,
		);
	}, [userData]);

	return (
		<section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-lg">
			<header className="space-y-2">
				<p className="text-xs uppercase tracking-[0.3em] text-slate-500">
					Admin Command Center
				</p>
				<h2 className="text-xl font-semibold text-slate-100">
					{selectedUserId ? `User ${selectedUserId}` : "Select a user"}
				</h2>
				<p className="text-sm text-slate-400">
					{selectedUserId
						? "Manage quotas, suspension, and real-time activity."
						: "Choose a user from the live table to reveal details."}
				</p>
			</header>

			{error && (
				<div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
					{error.message}
				</div>
			)}

			<div className="space-y-4">
				<h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
					Quota Usage
				</h3>
				{isLoading && selectedUserId ? (
					<div className="h-16 w-full animate-pulse rounded-xl bg-slate-900" />
				) : selectedUserId && userData ? (
					<ProgressBar value={requestCount} max={requestLimit} />
				) : (
					<div className="rounded-xl border border-dashed border-slate-800 px-4 py-6 text-sm text-slate-500">
						User data will appear once selected.
					</div>
				)}
			</div>

			<div className="space-y-4">
				<h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
					Actions
				</h3>
				<div className="space-y-3">
					<button
						type="button"
						onClick={onResetQuota}
						disabled={!selectedUserId || isMutating}
						className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-500/60 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
					>
						Reset Quota
					</button>
					<label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
						<span>Suspension</span>
						<input
							type="checkbox"
							checked={userData?.registryData.isSuspended ?? false}
							onChange={(event) => onToggleSuspend(event.target.checked)}
							disabled={!selectedUserId || isMutating}
							className="h-5 w-5 accent-emerald-500"
						/>
					</label>
					<div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
						<input
							type="number"
							min={1}
							value={addExtraAmount}
							onChange={(event) =>
								setAddExtraAmount(Number(event.target.value))
							}
							disabled={!selectedUserId || isMutating}
							className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
						/>
						<button
							type="button"
							onClick={() => onAddExtra(addExtraAmount)}
							disabled={!selectedUserId || isMutating}
							className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-500/60 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
						>
							Add Extra Requests
						</button>
					</div>
				</div>
			</div>

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
										{entry.totalRequestsAllowed -
											entry.remainingRequestsCount}{" "}
										/ {entry.totalRequestsAllowed} used
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
		</section>
	);
};
