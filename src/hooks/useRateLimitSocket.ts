import { useEffect } from "react";
import { io } from "socket.io-client";
import type { LimitExceededDto, RateUpdateDto } from "../shared/types";

type RateLimitSocketHandlers = {
	onRateUpdate: (payload: RateUpdateDto) => void;
	onLimitExceeded: (payload: LimitExceededDto) => void;
};

const RATE_UPDATE_EVENT = "rate:update";
const LIMIT_EXCEEDED_EVENT = "rate:limit_exceeded";

export const useRateLimitSocket = ({
	onRateUpdate,
	onLimitExceeded,
}: RateLimitSocketHandlers) => {
	useEffect(() => {
		const baseUrl = import.meta.env.VITE_API_BASE_URL;
		if (!baseUrl) {
			return;
		}

		const socket = io(baseUrl, {
			transports: ["websocket"],
			autoConnect: true,
		});

		socket.on(RATE_UPDATE_EVENT, onRateUpdate);
		socket.on(LIMIT_EXCEEDED_EVENT, onLimitExceeded);

		return () => {
			socket.off(RATE_UPDATE_EVENT, onRateUpdate);
			socket.off(LIMIT_EXCEEDED_EVENT, onLimitExceeded);
			socket.disconnect();
		};
	}, [onRateUpdate, onLimitExceeded]);
};
