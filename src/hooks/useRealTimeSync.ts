import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRateLimitSocket } from "./useRateLimitSocket";
import type {
	LimitExceededDto,
	RateUpdateDto,
	UserBaseDataDto,
	UserDataDto,
} from "../shared/types";

type RealTimeSyncOptions = {
	selectedUserId: string | null;
	triggerPulse: (userId: string) => void;
	triggerCritical: (userId: string) => void;
};

export const useRealTimeSync = ({
	selectedUserId,
	triggerPulse,
	triggerCritical,
}: RealTimeSyncOptions) => {
	const queryClient = useQueryClient();

	const handleRateUpdate = useCallback(
		(payload: RateUpdateDto) => {
			queryClient.setQueryData<UserBaseDataDto[]>(
				["users"],
				(previousUsersArray) => {
					if (!previousUsersArray || previousUsersArray.length === 0) {
						return [{ ...payload, isSuspended: false }];
					}
					let isNewUser = true;

					const newUsersArray = previousUsersArray.map((user) => {
						if (user.userId !== payload.userId) {
							return user;
						}

						isNewUser = false;
						return { ...user, ...payload };
					});

					if (isNewUser) {
						newUsersArray.unshift({ ...payload, isSuspended: false });
					}
					return newUsersArray;
				},
			);

			if (selectedUserId && selectedUserId === payload.userId) {
				queryClient.setQueryData<UserDataDto | undefined>(
					["user", selectedUserId],
					(previousUserData) => {
						if (!previousUserData) {
							return previousUserData;
						}
						const requestCount =
							payload.totalRequestsAllowed - payload.remainingRequestsCount;

						return {
							...previousUserData,
							requestsHistory: [
								payload,
								...previousUserData.requestsHistory,
							].slice(0, 50),
							registryData: {
								...previousUserData.registryData,
								lastRequestTimestamp: payload.lastRequestTimestamp,
							},
							windowData: {
								...previousUserData.windowData,
								currentRequestLimit: payload.totalRequestsAllowed,
								requestCount,
							},
						};
					},
				);
			}

			triggerPulse(payload.userId);
		},
		[queryClient, selectedUserId, triggerPulse],
	);

	const handleLimitExceeded = useCallback(
		(payload: LimitExceededDto) => {
			queryClient.setQueryData<UserBaseDataDto[]>(["users"], (previous) => {
				if (!previous) {
					return [];
				}
				return previous.map((user) =>
					user.userId === payload.userId
						? { ...user, rateLimitStatus: "Exceeded" }
						: user,
				);
			});

			triggerCritical(payload.userId);
		},
		[queryClient, triggerCritical],
	);

	useRateLimitSocket({
		onRateUpdate: handleRateUpdate,
		onLimitExceeded: handleLimitExceeded,
	});
};
