import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserById, fetchUsers } from "../api/users.service";
import type { ToastMessage } from "../components/Toast";
import { useRealTimeSync } from "../hooks/useRealTimeSync";
import { useUINotifications } from "../hooks/useUINotifications";
import { useUserOperations } from "../hooks/useUserOperations";
import { DEFAULT_REQUESTS_LIMIT_ADJUSTMENT } from "../shared/constants";
import type { UserBaseDataDto, UserDataDto } from "../shared/types";

export type DashboardContextType = {
	users: UserBaseDataDto[];
	isUsersLoading: boolean;
	usersError: Error | null;
	selectedUserId: string | null;
	selectUser: (userId: string) => void;
	selectedUserData: UserDataDto | undefined;
	isUserLoading: boolean;
	userError: Error | null;
	adjustLimitAmount: number;
	setAdjustLimitAmount: (value: number) => void;
	applyAdjustLimit: () => void;
	resetQuota: () => void;
	toggleSuspendUser: (isSuspended: boolean) => void;
	addExtraRequests: (amount: number) => void;
	isMutating: boolean;
	pulseUserIds: Set<string>;
	criticalUserIds: Set<string>;
	toasts: ToastMessage[];
	addToast: (type: ToastMessage["type"], message: string) => void;
	dismissToast: (id: string) => void;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [adjustLimitAmount, setAdjustLimitAmount] = useState(
		DEFAULT_REQUESTS_LIMIT_ADJUSTMENT,
	);

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

	const {
		resetQuota,
		toggleSuspendUser,
		addExtraRequestsCount,
		adjustRequestsLimit,
		isMutating,
	} = useUserOperations({
		selectedUserId,
		addToast,
	});

	useRealTimeSync({
		selectedUserId,
		triggerPulse,
		triggerCritical,
	});

	const selectUser = useCallback((userId: string) => {
		setSelectedUserId(userId);
	}, []);

	const addExtraRequests = useCallback(
		(amount: number) => {
			if (!Number.isFinite(amount) || amount < 1) {
				addToast("error", "Amount must be at least 1.");
				return;
			}
			addExtraRequestsCount(amount);
		},
		[addExtraRequestsCount, addToast],
	);

	const adjustLimit = useCallback(() => {
		if (!Number.isFinite(adjustLimitAmount) || adjustLimitAmount < 1) {
			addToast("error", "Limit must be at least 1.");
			return;
		}
		adjustRequestsLimit(adjustLimitAmount);
	}, [addToast, adjustLimitAmount, adjustRequestsLimit]);

	const value = useMemo<DashboardContextType>(
		() => ({
			users,
			isUsersLoading: isLoading,
			usersError: error ?? null,
			selectedUserId,
			selectUser,
			selectedUserData,
			isUserLoading,
			userError: userError ?? null,
			adjustLimitAmount,
			setAdjustLimitAmount,
			applyAdjustLimit: adjustLimit,
			resetQuota,
			toggleSuspendUser,
			addExtraRequests,
			isMutating,
			pulseUserIds,
			criticalUserIds,
			toasts,
			addToast,
			dismissToast,
		}),
		[
			addExtraRequests,
			addToast,
			adjustLimitAmount,
			adjustLimit,
			criticalUserIds,
			dismissToast,
			error,
			isLoading,
			isMutating,
			isUserLoading,
			pulseUserIds,
			resetQuota,
			selectedUserData,
			selectedUserId,
			selectUser,
			toggleSuspendUser,
			toasts,
			userError,
			users,
		],
	);

	return (
		<DashboardContext.Provider value={value}>
			{children}
		</DashboardContext.Provider>
	);
};

export const useDashboardContext = () => {
	const context = useContext(DashboardContext);
	if (!context) {
		throw new Error("useDashboardContext must be used within DashboardProvider");
	}
	return context;
};
