import { useCallback, useEffect, useRef, useState } from "react";
import type { ToastMessage } from "../components/Toast";
import {
	CRITICAL_DURATION_MS,
	PULSE_DURATION_MS,
	TOAST_DURATION_MS,
} from "../shared/constants";

type ToastType = ToastMessage["type"];

const createToastId = () =>
	globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

const clearTimer = (timers: Map<string, number>, key: string) => {
	const existing = timers.get(key);
	if (existing !== undefined) {
		window.clearTimeout(existing);
		timers.delete(key);
	}
};

export const useUINotifications = () => {
	const [pulseUserIds, setPulseUserIds] = useState<Set<string>>(new Set());
	const [criticalUserIds, setCriticalUserIds] = useState<Set<string>>(
		new Set(),
	);
	const [toasts, setToasts] = useState<ToastMessage[]>([]);

	const pulseTimersRef = useRef(new Map<string, number>());
	const criticalTimersRef = useRef(new Map<string, number>());
	const toastTimersRef = useRef(new Map<string, number>());

	const dismissToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
		clearTimer(toastTimersRef.current, id);
	}, []);

	const addToast = useCallback(
		(type: ToastType, message: string) => {
			const id = createToastId();

			setToasts((prev) => [...prev, { id, type, message }]);

			clearTimer(toastTimersRef.current, id);

			const timeoutId = window.setTimeout(() => {
				dismissToast(id);
			}, TOAST_DURATION_MS);

			toastTimersRef.current.set(id, timeoutId);
		},
		[dismissToast],
	);

	const triggerPulse = useCallback((userId: string) => {
		setPulseUserIds((prev) => {
			const next = new Set(prev);
			next.add(userId);
			return next;
		});

		clearTimer(pulseTimersRef.current, userId);

		const timeoutId = window.setTimeout(() => {
			setPulseUserIds((prev) => {
				if (!prev.has(userId)) {
					return prev;
				}
				const next = new Set(prev);
				next.delete(userId);
				return next;
			});
			pulseTimersRef.current.delete(userId);
		}, PULSE_DURATION_MS);

		pulseTimersRef.current.set(userId, timeoutId);
	}, []);

	const triggerCritical = useCallback((userId: string) => {
		setCriticalUserIds((prev) => {
			const next = new Set(prev);
			next.add(userId);
			return next;
		});

		clearTimer(criticalTimersRef.current, userId);

		const timeoutId = window.setTimeout(() => {
			setCriticalUserIds((prev) => {
				if (!prev.has(userId)) {
					return prev;
				}
				const next = new Set(prev);
				next.delete(userId);
				return next;
			});
			criticalTimersRef.current.delete(userId);
		}, CRITICAL_DURATION_MS);

		criticalTimersRef.current.set(userId, timeoutId);
	}, []);

	useEffect(() => {
		return () => {
			for (const timeoutId of pulseTimersRef.current.values()) {
				window.clearTimeout(timeoutId);
			}
			for (const timeoutId of criticalTimersRef.current.values()) {
				window.clearTimeout(timeoutId);
			}
			for (const timeoutId of toastTimersRef.current.values()) {
				window.clearTimeout(timeoutId);
			}
		};
	}, []);

	return {
		toasts,
		addToast,
		dismissToast,
		pulseUserIds,
		criticalUserIds,
		triggerPulse,
		triggerCritical,
	};
};
