import { requestJson } from "./client";
import type { UserBaseDataDto, UserDataDto } from "../types/rate-limit";

export const fetchUsers = () => requestJson<UserBaseDataDto[]>("/users");

export const fetchUserById = (userId: string) =>
	requestJson<UserDataDto>(`/users/${userId}`);

export const resetUserQuota = (userId: string) =>
	requestJson<{ userId: string; reset: boolean }>(`/users/${userId}/reset`, {
		method: "POST",
	});

export const adjustLimitAll = (newLimit: number) =>
	requestJson<{ updated: boolean }>("/users/adjust-limit-all", {
		method: "PATCH",
		body: { newLimit },
	});

export const toggleSuspend = (userId: string, isSuspended: boolean) =>
	requestJson<{ userId: string; suspended: boolean }>(
		`/users/${userId}/suspend`,
		{
			method: "PATCH",
			body: { isSuspended },
		},
	);

export const addExtraRequests = (userId: string, amount: number) =>
	requestJson<void>(`/users/${userId}/add-extra`, {
		method: "PATCH",
		body: { amount },
	});
