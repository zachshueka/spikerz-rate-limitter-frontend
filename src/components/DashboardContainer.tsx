import { Toasts } from "./Toast";
import { DashboardHeader } from "./DashboardHeader";
import { UserManagement } from "./UserManagement";

export const DashboardContainer = () => {

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100">
			<Toasts/>
			<div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
				<DashboardHeader />
				<UserManagement />
			</div>
		</div>
	);
};
