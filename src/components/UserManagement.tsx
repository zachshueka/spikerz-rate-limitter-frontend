import { ActiveUsersAmount } from "./ActiveUsersAmount";
import { GlobalControls } from "./GlobalControls";
import { UserDetailsPanel } from "./UserDetailsPanel";
import { UserTable } from "./UserTable";
import { UserTableSkeleton } from "./UserTableSkeleton";
import { UserTableTitle } from "./UserTableTitle";
import { useDashboardContext } from "../context/DashboardContext";

export const UserManagement = () => {
	const {
		isUsersLoading,
		usersError,
	} = useDashboardContext();
	
	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
			<section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<UserTableTitle />
					<ActiveUsersAmount />
				</div>

				{usersError ? (
					<div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
						{usersError.message}
					</div>
				) : isUsersLoading ? (
					<UserTableSkeleton />
				) : (
					<UserTable />
				)}
			</section>

			<div className="space-y-6">
				<GlobalControls />
				<UserDetailsPanel />
			</div>
		</div>
	);
};
