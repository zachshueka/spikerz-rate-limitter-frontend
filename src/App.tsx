import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserById, fetchUsers } from "./api/users.service";
import { Toasts } from "./components/Toast";
import { DashboardHeader } from "./components/DashboardHeader";
import { UserManagement } from "./components/UserManagement";
import { useRealTimeSync } from "./hooks/useRealTimeSync";
import { useUINotifications } from "./hooks/useUINotifications";
import { useUserOperations } from "./hooks/useUserOperations";
import type { UserBaseDataDto, UserDataDto } from "./shared/types";
import { DEFAULT_REQUESTS_LIMIT_ADJUSTMENT } from "./shared/constants";

function App() {
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [adjustLimitAmount, setAdjustLimitAmount] = useState(DEFAULT_REQUESTS_LIMIT_ADJUSTMENT);

	const { data: users = [], isLoading, error } = useQuery<
		UserBaseDataDto[],
		Error
	>({
		queryKey: ["users"],
		queryFn: fetchUsers,
	});

	const {
		data: selectedUserData,
		isLoading: isUserLoading,
		error: userError,
	} = useQuery<UserDataDto, Error>({
		queryKey: ["user", selectedUserId],
		queryFn: () => fetchUserById(selectedUserId ?? ""),
		enabled: !!selectedUserId,
	});

	const {
		toasts,
		addToast,
		dismissToast,
		pulseUserIds,
		criticalUserIds,
		triggerPulse,
		triggerCritical,
	} = useUINotifications();

	const { resetQuota, toggleSuspendUser, addExtraRequestsCount, adjustRequestsLimit, isMutating } =
		useUserOperations({
			selectedUserId,
			addToast,
		});

	useRealTimeSync({
		selectedUserId,
		triggerPulse,
		triggerCritical,
	});

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100">
			<Toasts toasts={toasts} onDismiss={dismissToast} />
			<div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
				<DashboardHeader />

				<UserManagement
					users={users}
					isLoading={isLoading}
					error={error}
					selectedUserId={selectedUserId}
					onSelectUser={(userId) => setSelectedUserId(userId)}
					pulseUserIds={pulseUserIds}
					criticalUserIds={criticalUserIds}
					userData={selectedUserData}
					isUserLoading={isUserLoading}
					userError={userError}
					onResetQuota={resetQuota}
					onToggleSuspend={toggleSuspendUser}
					onAddExtra={addExtraRequestsCount}
					isMutating={isMutating}
					adjustLimitAmount={adjustLimitAmount}
					onAdjustLimitAmountChange={setAdjustLimitAmount}
					onAdjustLimitAll={() => adjustRequestsLimit(adjustLimitAmount)}
				/>
			</div>
		</div>
	);
}

export default App;
