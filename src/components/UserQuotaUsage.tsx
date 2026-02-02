import { ProgressBar } from "./ProgressBar";

type UserQuotaUsageProps = {
	selectedUserId: string | null;
	requestCount: number;
	requestLimit: number;
	isLoading: boolean;
	hasUserData: boolean;
};

export const UserQuotaUsage = ({
	selectedUserId,
	requestCount,
	requestLimit,
	isLoading,
	hasUserData,
}: UserQuotaUsageProps) => {
	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
				Quota Usage
			</h3>
			{isLoading && selectedUserId ? (
				<div className="h-16 w-full animate-pulse rounded-xl bg-slate-900" />
			) : selectedUserId && hasUserData ? (
				<ProgressBar value={requestCount} max={requestLimit} />
			) : (
				<div className="rounded-xl border border-dashed border-slate-800 px-4 py-6 text-sm text-slate-500">
					User data will appear once selected.
				</div>
			)}
		</div>
	);
};
