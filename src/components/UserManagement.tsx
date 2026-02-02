import type { UserBaseDataDto, UserDataDto } from "../shared/types";
import { ActiveUsersAmount } from "./ActiveUsersAmount";
import { GlobalControls } from "./GlobalControls";
import { UserDetailsPanel } from "./UserDetailsPanel";
import { UserTable } from "./UserTable";
import { UserTableSkeleton } from "./UserTableSkeleton";
import { UserTableTitle } from "./UserTableTitle";

type UserManagementProps = {
	users: UserBaseDataDto[];
	isLoading: boolean;
	error: Error | null;
	selectedUserId: string | null;
	onSelectUser: (userId: string) => void;
	pulseUserIds: Set<string>;
	criticalUserIds: Set<string>;
	userData: UserDataDto | undefined;
	isUserLoading: boolean;
	userError: Error | null;
	onResetQuota: () => void;
	onToggleSuspend: (isSuspended: boolean) => void;
	onAddExtra: (amount: number) => void;
	isMutating: boolean;
	adjustLimitAmount: number;
	onAdjustLimitAmountChange: (value: number) => void;
	onAdjustLimitAll: () => void;
};

export const UserManagement = ({
	users,
	isLoading,
	error,
	selectedUserId,
	onSelectUser,
	pulseUserIds,
	criticalUserIds,
	userData,
	isUserLoading,
	userError,
	onResetQuota,
	onToggleSuspend,
	onAddExtra,
	isMutating,
	adjustLimitAmount,
	onAdjustLimitAmountChange,
	onAdjustLimitAll,
}: UserManagementProps) => {
	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
			<section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-lg">
				<div className="flex items-center justify-between">
					<UserTableTitle />
					<ActiveUsersAmount count={users.length} />
				</div>

				{error ? (
					<div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
						{error.message}
					</div>
				) : isLoading ? (
					<UserTableSkeleton />
				) : (
					<UserTable
						users={users}
						selectedUserId={selectedUserId}
						onSelect={onSelectUser}
						pulseUserIds={pulseUserIds}
						criticalUserIds={criticalUserIds}
					/>
				)}
			</section>

			<div className="space-y-6">
				<GlobalControls
					adjustLimitAmount={adjustLimitAmount}
					onAdjustLimitAmountChange={onAdjustLimitAmountChange}
					onAdjustLimitAll={onAdjustLimitAll}
					isMutating={isMutating}
				/>
				
				<UserDetailsPanel
					selectedUserId={selectedUserId}
					userData={userData}
					isLoading={isUserLoading}
					error={userError}
					onResetQuota={onResetQuota}
					onToggleSuspend={onToggleSuspend}
					onAddExtra={onAddExtra}
					isMutating={isMutating}
				/>
			</div>
		</div>
	);
};
