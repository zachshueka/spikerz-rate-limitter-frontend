import { UserRow } from "./UserRow";
import { useDashboardContext } from "../context/DashboardContext";

export const UserTable = () => {
	const { users, selectedUserId, selectUser, pulseUserIds, criticalUserIds } =
		useDashboardContext();
	return (
		<div className="space-y-3">
			<div className="grid grid-cols-[1.2fr_1.2fr_1fr_0.8fr_1fr] gap-4 px-4 text-xs uppercase tracking-[0.2em] text-slate-500">
				<span>User ID</span>
				<span>Requests</span>
				<span>Reset Time</span>
				<span>Status</span>
				<span>Last Request</span>
			</div>
			<div className="space-y-3">
				{users.map((user) => (
					<UserRow
						key={user.userId}
						user={user}
						isSelected={selectedUserId === user.userId}
						onSelect={selectUser}
						isPulsing={pulseUserIds.has(user.userId)}
						isCritical={criticalUserIds.has(user.userId)}
					/>
				))}
			</div>
		</div>
	);
};
