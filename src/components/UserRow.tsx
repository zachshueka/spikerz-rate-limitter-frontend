import { memo } from "react";
import type { UserBaseDataDto } from "../shared/types";
import { StatusBadge } from "./StatusBadge";
import { useTimer } from "../hooks/useTimer";
import { formatCountdown, formatRelativeTime } from "../shared/utilities";

type UserRowProps = {
	user: UserBaseDataDto;
	isSelected: boolean;
	onSelect: (userId: string) => void;
	isPulsing: boolean;
	isCritical: boolean;
};

export const UserRow = memo(
	({
		user,
		isSelected,
		onSelect,
		isPulsing,
		isCritical,
	}: UserRowProps) => {
		const now = useTimer();

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
				{user.isSuspended ? (
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
