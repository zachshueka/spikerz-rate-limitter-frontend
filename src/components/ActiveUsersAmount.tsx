import { Users } from "lucide-react";
import { useDashboardContext } from "../context/DashboardContext";

export const ActiveUsersAmount = () => {
	const { users } = useDashboardContext();
	return (
		<div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
			<Users className="h-3.5 w-3.5 text-slate-400" />
			<span>{users.length} users</span>
		</div>
	);
};
