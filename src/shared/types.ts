export type RateLimitStatus = "OK" | "Warning" | "Exceeded";

export type UserBaseDataDto = RateUpdateDto & { isSuspended: boolean };

export type RateUpdateDto = {
	userId: string;
	remainingRequestsCount: number;
	totalRequestsAllowed: number;
	resetTimeTimestamp: number;
	rateLimitStatus: RateLimitStatus;
	lastRequestTimestamp: number;
};

export type LimitExceededDto = {
	userId: string;
};

export type UserRegistryData = {
	isSuspended: boolean;
	baseRequestLimit: number;
	lastRequestTimestamp: number;
};

export type UserWindowData = {
	currentRequestLimit: number;
	requestCount: number;
	windowDurationMs: number;
};

export type UserDataDto = {
	userId: string;
	registryData: UserRegistryData;
	windowData: UserWindowData;
	requestsHistory: RateUpdateDto[];
};
