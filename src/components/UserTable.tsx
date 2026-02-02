import { memo } from "react";
import type { UserBaseDataDto } from "../types/rate-limit";
import { StatusBadge } from "./StatusBadge";
import { useNow } from "../hooks/useNow";
import { formatCountdown, formatRelativeTime } from "../utils/time";

type UserTableProps = {
	users: UserBaseDataDto[];
	selectedUserId: string | null;
	onSelect: (userId: string) => void;
	pulseUserIds: Set<string>;
	criticalUserIds: Set<string>;
	suspendedUserIds: Set<string>;
};

const UserRow = memo(
	({
		user,
		isSelected,
		onSelect,
		isPulsing,
		isCritical,
		isSuspended,
	}: {
		user: UserBaseDataDto;
		isSelected: boolean;
		onSelect: (userId: string) => void;
		isPulsing: boolean;
		isCritical: boolean;
		isSuspended: boolean;
	}) => {
		const now = useNow();

		return (
			<button
				type="button"
				onClick={() => onSelect(user.userId)}
				className={`grid w-full grid-cols-[1.2fr_1.2fr_1fr_0.8fr_1fr] items-center gap-4 rounded-xl border px-4 py-4 text-left transition ${
					isSelected
						? "border-emerald-500/60 bg-emerald-500/10"
						: "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900"
				} ${isPulsing ? "ring-2 ring-emerald-400/60" : ""} ${
					isCritical ? "animate-pulse border-rose-500/70 bg-rose-500/15" : ""
				}`}
			>
				<div className="text-sm font-semibold text-slate-100">{user.userId}</div>
				<div className="text-sm text-slate-300">
					{user.totalRequestsAllowed - user.remainingRequestsCount} /{" "}
					{user.totalRequestsAllowed}
				</div>
				<div className="text-sm text-slate-300">
					{formatCountdown(user.resetTimeTimestamp, now)}
				</div>
				{isSuspended ? (
					<span className="inline-flex items-center rounded-full border border-slate-500/40 bg-slate-500/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
						Suspended
					</span>
				) : (
					<StatusBadge status={user.rateLimitStatus} />
				)}
				<div className="text-sm text-slate-400">
					{formatRelativeTime(user.lastRequestTimestamp, now)}
				</div>
			</button>
		);
	},
);

UserRow.displayName = "UserRow";

export const UserTable = ({
	users,
	selectedUserId,
	onSelect,
	pulseUserIds,
	criticalUserIds,
	suspendedUserIds,
}: UserTableProps) => {
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
						onSelect={onSelect}
						isPulsing={pulseUserIds.has(user.userId)}
						isCritical={criticalUserIds.has(user.userId)}
						isSuspended={user.isSuspended || suspendedUserIds.has(user.userId)}
					/>
				))}
			</div>
		</div>
	);
};
