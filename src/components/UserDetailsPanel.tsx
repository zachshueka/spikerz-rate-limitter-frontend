import { UserActionsPanel } from "./UserActionsPanel";
import { UserDetailsHeader } from "./UserDetailsHeader";
import { UserQuotaUsage } from "./UserQuotaUsage";
import { UserRealTimeFeed } from "./UserRealTimeFeed";
import { useDashboardContext } from "../context/DashboardContext";

export const UserDetailsPanel = () => {
	const { userError } = useDashboardContext();

	return (
		<section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-lg">
			<UserDetailsHeader />

			{userError && (
				<div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
					{userError.message}
				</div>
			)}

			<UserQuotaUsage />
			<UserActionsPanel />
			<UserRealTimeFeed />
		</section>
	);
};
