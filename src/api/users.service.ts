import { axiosInstance } from "./axiosInstance";
import type { UserBaseDataDto, UserDataDto } from "../shared/types";

export const fetchUsers = async () => {
	const response = await axiosInstance.get<UserBaseDataDto[]>("/users");
	return response.data;
};

export const fetchUserById = async (userId: string) => {
	const response = await axiosInstance.get<UserDataDto>(`/users/${userId}`);
	return response.data;
};

export const resetUserQuota = async (userId: string) => {
	const response = await axiosInstance.post<{ userId: string; reset: boolean }>(
		`/users/${userId}/reset`,
	);
	return response.data;
};

export const adjustLimitAll = async (newLimit: number) => {
	const response = await axiosInstance.patch<{ updated: boolean }>(
		"/users/adjust-limit-all",
		{ newLimit },
	);
	return response.data;
};

export const toggleSuspend = async (userId: string, isSuspended: boolean) => {
	const response = await axiosInstance.patch<{
		userId: string;
		suspended: boolean;
	}>(`/users/${userId}/suspend`, { isSuspended });
	return response.data;
};

export const addExtraRequests = async (userId: string, amount: number) => {
	await axiosInstance.patch(`/users/${userId}/add-extra`, { amount });
};
