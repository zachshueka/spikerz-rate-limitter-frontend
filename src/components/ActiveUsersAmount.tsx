import { Users } from "lucide-react";

type ActiveUsersAmountProps = {
	count: number;
};

export const ActiveUsersAmount = ({ count }: ActiveUsersAmountProps) => {
	return (
		<div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
			<Users className="h-3.5 w-3.5 text-slate-400" />
			<span>{count} users</span>
		</div>
	);
};
