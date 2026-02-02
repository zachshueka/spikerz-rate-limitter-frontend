import { ProgressBar } from "./ProgressBar";
import { useDashboardContext } from "../context/DashboardContext";

export const UserQuotaUsage = () => {
	const { selectedUserId, selectedUserData, isUserLoading } =
		useDashboardContext();
	const requestLimit =
		selectedUserData?.windowData.currentRequestLimit ??
		selectedUserData?.registryData.baseRequestLimit ??
		0;
	const requestCount = selectedUserData?.windowData.requestCount ?? 0;

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
				Quota Usage
			</h3>
			{isUserLoading && selectedUserId ? (
				<div className="h-16 w-full animate-pulse rounded-xl bg-slate-900" />
			) : selectedUserId && selectedUserData ? (
				<ProgressBar value={requestCount} max={requestLimit} />
			) : (
				<div className="rounded-xl border border-dashed border-slate-800 px-4 py-6 text-sm text-slate-500">
					User data will appear once selected.
				</div>
			)}
		</div>
	);
};
