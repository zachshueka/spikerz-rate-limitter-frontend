import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	addExtraRequests,
	adjustLimitAll,
	resetUserQuota,
	toggleSuspend,
} from "../api/users.service";
import type { UserBaseDataDto, UserDataDto } from "../shared/types";
import { WARNING_THRESHOLD_RATIO } from "../shared/constants";

type UseUserOperationsOptions = {
	selectedUserId: string | null;
	addToast: (type: "success" | "error", message: string) => void;
};

export const useUserOperations = ({
	selectedUserId,
	addToast,
}: UseUserOperationsOptions) => {
	const queryClient = useQueryClient();

	const handleError = useCallback(
		(errorValue: unknown, fallback: string) => {
			const message =
				errorValue instanceof Error ? errorValue.message : fallback;
			addToast("error", message);
		},
		[addToast],
	);

	const resetQuotaMutation = useMutation({
		mutationFn: () => resetUserQuota(selectedUserId ?? ""),
		onSuccess: () => {
			addToast("success", "Quota reset for user.");

			void queryClient.invalidateQueries({ queryKey: ["users"] });

			if (selectedUserId) {
				void queryClient.invalidateQueries({
					queryKey: ["user", selectedUserId],
				});
			}
		},
		onError: (errorValue) => handleError(errorValue, "Failed to reset quota."),
	});

	const toggleSuspendMutation = useMutation({
		mutationFn: (isSuspended: boolean) =>
			toggleSuspend(selectedUserId ?? "", isSuspended),

		onSuccess: (_, isSuspended) => {
			addToast("success", isSuspended ? "User suspended." : "User unlocked.");

			queryClient.setQueryData<UserBaseDataDto[]>(
				["users"],
				(previousUsersArray) => {
					if (!previousUsersArray || !selectedUserId) {
						return previousUsersArray;
					}

					return previousUsersArray.map((user) =>
						user.userId === selectedUserId ? { ...user, isSuspended } : user,
					);
				},
			);

			if (selectedUserId) {
				queryClient.setQueryData<UserDataDto | undefined>(
					["user", selectedUserId],
					(previousUserData) => {
						if (!previousUserData) {
							return previousUserData;
						}
						return {
							...previousUserData,
							registryData: {
								...previousUserData.registryData,
								isSuspended,
							},
						};
					},
				);

				void queryClient.invalidateQueries({
					queryKey: ["user", selectedUserId],
				});
			}

			void queryClient.invalidateQueries({ queryKey: ["users"] });
		},

		onError: (errorValue) =>
			handleError(errorValue, "Failed to update suspension."),
	});

	const addExtraRequestsMutation = useMutation({
		mutationFn: (amount: number) =>
			addExtraRequests(selectedUserId ?? "", amount),

		onSuccess: () => {
			addToast("success", "Extra requests added.");

			void queryClient.invalidateQueries({ queryKey: ["users"] });

			if (selectedUserId) {
				void queryClient.invalidateQueries({
					queryKey: ["user", selectedUserId],
				});
			}
		},

		onError: (errorValue) =>
			handleError(errorValue, "Failed to add extra requests."),
	});

	const adjustRequestsLimitMutation = useMutation({
		mutationFn: (newLimit: number) => adjustLimitAll(newLimit),

		onSuccess: (_, newLimit) => {
			addToast("success", "Global limits updated.");

			const warningThreshold = Math.ceil(newLimit * WARNING_THRESHOLD_RATIO);

			queryClient.setQueryData<UserBaseDataDto[]>(
				["users"],
				(previousUsersArray) => {
					if (!previousUsersArray) {
						return previousUsersArray;
					}

					return previousUsersArray.map((previousUserData) => {
						const newUsedRequestsCount =
							previousUserData.totalRequestsAllowed -
							previousUserData.remainingRequestsCount;

						const newRemainingRequestsCount = newLimit - newUsedRequestsCount;

						const newRateLimitStatus =
							newRemainingRequestsCount <= 0
								? "Exceeded"
								: newRemainingRequestsCount <= warningThreshold
									? "Warning"
									: "OK";
						return {
							...previousUserData,
							totalRequestsAllowed: newLimit,
							remainingRequestsCount: newRemainingRequestsCount,
							rateLimitStatus: newRateLimitStatus,
						};
					});
				},
			);

			if (selectedUserId) {
				queryClient.setQueryData<UserDataDto | undefined>(
					["user", selectedUserId],
					(previousUserData) => {
						if (!previousUserData) {
							return previousUserData;
						}
						return {
							...previousUserData,
							registryData: {
								...previousUserData.registryData,
								baseRequestLimit: newLimit,
							},
							windowData: {
								...previousUserData.windowData,
								currentRequestLimit: newLimit,
							},
						};
					},
				);
			}
		},

		onError: (errorValue) =>
			handleError(errorValue, "Failed to adjust global limit."),
	});

	const resetQuota = useCallback(() => {
		if (!selectedUserId) {
			return;
		}
		resetQuotaMutation.mutate();
	}, [resetQuotaMutation, selectedUserId]);

	const toggleSuspendUser = useCallback(
		(isSuspended: boolean) => {
			if (!selectedUserId) {
				return;
			}
			toggleSuspendMutation.mutate(isSuspended);
		},
		[selectedUserId, toggleSuspendMutation],
	);

	const addExtraRequestsCount = useCallback(
		(amount: number) => {
			if (!selectedUserId) {
				return;
			}
			addExtraRequestsMutation.mutate(amount);
		},
		[addExtraRequestsMutation, selectedUserId],
	);

	const adjustRequestsLimit = useCallback(
		(newLimit: number) => {
			adjustRequestsLimitMutation.mutate(newLimit);
		},
		[adjustRequestsLimitMutation],
	);

	const isMutating =
		resetQuotaMutation.isPending ||
		toggleSuspendMutation.isPending ||
		addExtraRequestsMutation.isPending ||
		adjustRequestsLimitMutation.isPending;

	return {
		resetQuota,
		toggleSuspendUser,
		addExtraRequestsCount,
		adjustRequestsLimit,
		isMutating,
		isResetting: resetQuotaMutation.isPending,
		isTogglingSuspend: toggleSuspendMutation.isPending,
		isAddingExtra: addExtraRequestsMutation.isPending,
		isAdjustingLimit: adjustRequestsLimitMutation.isPending,
	};
};
