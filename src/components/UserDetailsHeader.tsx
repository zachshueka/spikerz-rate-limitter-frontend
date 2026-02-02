import { useDashboardContext } from "../context/DashboardContext";

export const UserDetailsHeader = () => {
	const { selectedUserId } = useDashboardContext();
	return (
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
	);
};
