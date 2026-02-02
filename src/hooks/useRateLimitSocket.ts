import { useEffect } from "react";
import { io } from "socket.io-client";
import type { LimitExceededDto, RateUpdateDto } from "../types/rate-limit";

type RateLimitSocketHandlers = {
	onRateUpdate: (payload: RateUpdateDto) => void;
	onLimitExceeded: (payload: LimitExceededDto) => void;
};

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

		socket.on("rate:update", onRateUpdate);
		socket.on("rate:limit_exceeded", onLimitExceeded);

		return () => {
			socket.off("rate:update", onRateUpdate);
			socket.off("rate:limit_exceeded", onLimitExceeded);
			socket.disconnect();
		};
	}, [onRateUpdate, onLimitExceeded]);
};
