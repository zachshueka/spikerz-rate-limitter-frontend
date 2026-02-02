import { useState } from "react";
import { useDashboardContext } from "../context/DashboardContext";

export const UserActionsPanel = () => {
	const {
		selectedUserId,
		selectedUserData,
		isMutating,
		resetQuota,
		toggleSuspendUser,
		addExtraRequests,
	} = useDashboardContext();
	const [addExtraAmount, setAddExtraAmount] = useState(5);

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
				Actions
			</h3>
			<div className="space-y-3">
				<button
					type="button"
					onClick={resetQuota}
					disabled={!selectedUserId || isMutating}
					className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-500/60 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
				>
					Reset Quota
				</button>
				<label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-200">
					<span>Suspension</span>
					<input
						type="checkbox"
						checked={selectedUserData?.registryData.isSuspended ?? false}
						onChange={(event) => toggleSuspendUser(event.target.checked)}
						disabled={!selectedUserId || isMutating}
						className="h-5 w-5 accent-emerald-500"
					/>
				</label>
				<div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
					<input
						type="number"
						min={1}
						value={addExtraAmount}
						onChange={(event) => setAddExtraAmount(Number(event.target.value))}
						disabled={!selectedUserId || isMutating}
						className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
					/>
					<button
						type="button"
						onClick={() => addExtraRequests(addExtraAmount)}
						disabled={!selectedUserId || isMutating}
						className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-amber-500/60 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
					>
						Add Extra Requests
					</button>
				</div>
			</div>
		</div>
	);
};
