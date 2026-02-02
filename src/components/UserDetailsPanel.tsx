import { useMemo } from "react";
import type { UserDataDto } from "../shared/types";
import { useTimer } from "../hooks/useTimer";
import { UserActionsPanel } from "./UserActionsPanel";
import { UserDetailsHeader } from "./UserDetailsHeader";
import { UserQuotaUsage } from "./UserQuotaUsage";
import { UserRealTimeFeed } from "./UserRealTimeFeed";

type UserDetailsPanelProps = {
	selectedUserId: string | null;
	userData: UserDataDto | undefined;
	isLoading: boolean;
	error: Error | null;
	onResetQuota: () => void;
	onToggleSuspend: (isSuspended: boolean) => void;
	onAddExtra: (amount: number) => void;
	isMutating: boolean;
};

export const UserDetailsPanel = ({
	selectedUserId,
	userData,
	isLoading,
	error,
	onResetQuota,
	onToggleSuspend,
	onAddExtra,
	isMutating,
}: UserDetailsPanelProps) => {
	const now = useTimer();

	const requestLimit =
		userData?.windowData.currentRequestLimit ??
		userData?.registryData.baseRequestLimit ??
		0;
		
	const requestCount = userData?.windowData.requestCount ?? 0;

	const history = useMemo(() => {
		if (!userData?.requestsHistory) {
			return [];
		}
		return [...userData.requestsHistory].sort(
			(a, b) => b.lastRequestTimestamp - a.lastRequestTimestamp,
		);
	}, [userData]);

	return (
		<section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-lg">
			<UserDetailsHeader selectedUserId={selectedUserId} />

			{error && (
				<div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
					{error.message}
				</div>
			)}

			<UserQuotaUsage
				selectedUserId={selectedUserId}
				requestCount={requestCount}
				requestLimit={requestLimit}
				isLoading={isLoading}
				hasUserData={!!userData}
			/>

			<UserActionsPanel
				selectedUserId={selectedUserId}
				isSuspended={userData?.registryData.isSuspended ?? false}
				isMutating={isMutating}
				onResetQuota={onResetQuota}
				onToggleSuspend={onToggleSuspend}
				onAddExtra={onAddExtra}
			/>

			<UserRealTimeFeed
				selectedUserId={selectedUserId}
				isLoading={isLoading}
				history={history}
				now={now}
			/>
		</section>
	);
};
