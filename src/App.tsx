import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gauge, Users } from "lucide-react";
import {
	addExtraRequests,
	adjustLimitAll,
	fetchUserById,
	fetchUsers,
	resetUserQuota,
	toggleSuspend,
} from "./api/users";
import { UserDetailsPanel } from "./components/UserDetailsPanel";
import { UserTable } from "./components/UserTable";
import { UserTableSkeleton } from "./components/UserTableSkeleton";
import { Toasts } from "./components/Toast";
import type {
	UserBaseDataDto,
	RateUpdateDto,
	UserDataDto,
} from "./types/rate-limit";
import { useRateLimitSocket } from "./hooks/useRateLimitSocket";

type ToastState = {
	id: string;
	type: "success" | "error";
	message: string;
};

const createToastId = () =>
	globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

function App() {
	const queryClient = useQueryClient();
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [pulseUserIds, setPulseUserIds] = useState<Set<string>>(new Set());
	const [criticalUserIds, setCriticalUserIds] = useState<Set<string>>(
		new Set(),
	);
	const [suspendedUserIds, setSuspendedUserIds] = useState<Set<string>>(
		new Set(),
	);
	const [toasts, setToasts] = useState<ToastState[]>([]);
	const [adjustLimitAmount, setAdjustLimitAmount] = useState(100);

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
		enabled: Boolean(selectedUserId),
	});

	const addToast = useCallback((type: ToastState["type"], message: string) => {
		const id = createToastId();
		setToasts((prev) => [...prev, { id, type, message }]);
		window.setTimeout(() => {
			setToasts((prev) => prev.filter((toast) => toast.id !== id));
		}, 4000);
	}, []);

	const handleError = useCallback(
		(errorValue: unknown, fallback: string) => {
			const message =
				errorValue instanceof Error ? errorValue.message : fallback;
			addToast("error", message);
		},
		[addToast],
	);

	const resetMutation = useMutation({
		mutationFn: () => resetUserQuota(selectedUserId ?? ""),
		onSuccess: () => {
			addToast("success", "Quota reset for user.");
			void queryClient.invalidateQueries({ queryKey: ["users"] });
			if (selectedUserId) {
				void queryClient.invalidateQueries({ queryKey: ["user", selectedUserId] });
			}
		},
		onError: (errorValue) => handleError(errorValue, "Failed to reset quota."),
	});

	const toggleSuspendMutation = useMutation({
		mutationFn: (isSuspended: boolean) =>
			toggleSuspend(selectedUserId ?? "", isSuspended),
		onSuccess: (_, isSuspended) => {
			addToast(
				"success",
				isSuspended ? "User suspended." : "User suspension cleared.",
			);
			void queryClient.invalidateQueries({ queryKey: ["users"] });
			if (selectedUserId) {
				void queryClient.invalidateQueries({ queryKey: ["user", selectedUserId] });
				setSuspendedUserIds((prev) => {
					const next = new Set(prev);
					if (isSuspended) {
						next.add(selectedUserId);
					} else {
						next.delete(selectedUserId);
					}
					return next;
				});
			}
		},
		onError: (errorValue) =>
			handleError(errorValue, "Failed to update suspension."),
	});

	const addExtraMutation = useMutation({
		mutationFn: (amount: number) =>
			addExtraRequests(selectedUserId ?? "", amount),
		onSuccess: () => {
			addToast("success", "Extra requests added.");
			void queryClient.invalidateQueries({ queryKey: ["users"] });
			if (selectedUserId) {
				void queryClient.invalidateQueries({ queryKey: ["user", selectedUserId] });
			}
		},
		onError: (errorValue) =>
			handleError(errorValue, "Failed to add extra requests."),
	});

	const adjustLimitMutation = useMutation({
		mutationFn: (newLimit: number) => adjustLimitAll(newLimit),
		onSuccess: (_, newLimit) => {
			addToast("success", "Global limits updated.");
			const warningThreshold = Math.ceil(newLimit * 0.1);
			queryClient.setQueryData<UserBaseDataDto[]>(["users"], (previous) => {
				if (!previous) {
					return previous;
				}
				return previous.map((user) => {
					const usedRequests =
						user.totalRequestsAllowed - user.remainingRequestsCount;
					const nextRemaining = newLimit - usedRequests;
					const nextStatus =
						nextRemaining <= 0
							? "Exceeded"
							: nextRemaining <= warningThreshold
								? "Warning"
								: "OK";
					return {
						...user,
						totalRequestsAllowed: newLimit,
						remainingRequestsCount: nextRemaining,
						rateLimitStatus: nextStatus,
					};
				});
			});

			if (selectedUserId) {
				queryClient.setQueryData<UserDataDto | undefined>(
					["user", selectedUserId],
					(previous) => {
						if (!previous) {
							return previous;
						}
						return {
							...previous,
							registryData: {
								...previous.registryData,
								baseRequestLimit: newLimit,
							},
							windowData: {
								...previous.windowData,
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

	const isMutating =
		resetMutation.isPending ||
		toggleSuspendMutation.isPending ||
		addExtraMutation.isPending ||
		adjustLimitMutation.isPending;

	const triggerPulse = useCallback((userId: string) => {
		setPulseUserIds((prev) => {
			const next = new Set(prev);
			next.add(userId);
			return next;
		});
		window.setTimeout(() => {
			setPulseUserIds((prev) => {
				if (!prev.has(userId)) {
					return prev;
				}
				const next = new Set(prev);
				next.delete(userId);
				return next;
			});
		}, 1200);
	}, []);

	const triggerCritical = useCallback((userId: string) => {
		setCriticalUserIds((prev) => {
			const next = new Set(prev);
			next.add(userId);
			return next;
		});
		window.setTimeout(() => {
			setCriticalUserIds((prev) => {
				if (!prev.has(userId)) {
					return prev;
				}
				const next = new Set(prev);
				next.delete(userId);
				return next;
			});
		}, 1600);
	}, []);

	const handleRateUpdate = useCallback(
		(payload: RateUpdateDto) => {
			queryClient.setQueryData<UserBaseDataDto[]>(["users"], (previous) => {
				if (!previous || previous.length === 0) {
					return [{ ...payload, isSuspended: false }];
				}
				let found = false;
				const next = previous.map((user) => {
					if (user.userId !== payload.userId) {
						return user;
					}
					found = true;
					return { ...user, ...payload };
				});
				if (!found) {
					next.unshift({ ...payload, isSuspended: false });
				}
				return next;
			});

			if (selectedUserId && selectedUserId === payload.userId) {
				queryClient.setQueryData<UserDataDto | undefined>(
					["user", selectedUserId],
					(previous) => {
						if (!previous) {
							return previous;
						}
						const requestCount =
							payload.totalRequestsAllowed -
							payload.remainingRequestsCount;
						return {
							...previous,
							requestsHistory: [
								payload,
								...previous.requestsHistory,
							].slice(0, 50),
							registryData: {
								...previous.registryData,
								lastRequestTimestamp: payload.lastRequestTimestamp,
							},
							windowData: {
								...previous.windowData,
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
		(payload: { userId: string }) => {
			queryClient.setQueryData<UserBaseDataDto[]>(["users"], (previous) => {
				if (!previous) {
					return previous;
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

	useEffect(() => {
		if (!selectedUserData) {
			return;
		}
		setSuspendedUserIds((prev) => {
			const next = new Set(prev);
			if (selectedUserData.registryData.isSuspended) {
				next.add(selectedUserData.userId);
			} else {
				next.delete(selectedUserData.userId);
			}
			return next;
		});
	}, [selectedUserData]);

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100">
			<Toasts
				toasts={toasts}
				onDismiss={(id) =>
					setToasts((prev) => prev.filter((toast) => toast.id !== id))
				}
			/>
			<div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
				<header className="flex flex-wrap items-center justify-between gap-6">
					<div className="space-y-2">
						<div className="flex items-center gap-3 text-slate-200">
							<Gauge className="h-6 w-6 text-emerald-400" />
							<span className="text-xs uppercase tracking-[0.4em] text-slate-500">
								Rate Limit Admin
							</span>
						</div>
						<h1 className="text-3xl font-semibold text-white">
							Rate Limiting Command Dashboard
						</h1>
						<p className="max-w-2xl text-sm text-slate-400">
							Monitor real-time usage across every client, detect bursts, and
							issue immediate controls without leaving the live feed.
						</p>
					</div>
				</header>

				<div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
					<section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-lg">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs uppercase tracking-[0.3em] text-slate-500">
									Live User Table
								</p>
								<h2 className="text-xl font-semibold text-slate-100">
									Real-Time Overview
								</h2>
							</div>
							<div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
								<Users className="h-3.5 w-3.5 text-slate-400" />
								<span>{users.length} users</span>
							</div>
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
								onSelect={(userId) => setSelectedUserId(userId)}
								pulseUserIds={pulseUserIds}
								criticalUserIds={criticalUserIds}
								suspendedUserIds={suspendedUserIds}
							/>
						)}
					</section>

					<div className="space-y-6">
						<section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-lg">
							<h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
								Global Adjustment
							</h3>
							<p className="mt-2 text-sm text-slate-400">
								Apply a new base request limit for every user.
							</p>
							<div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
								<input
									type="number"
									min={1}
									value={adjustLimitAmount}
									onChange={(event) =>
										setAdjustLimitAmount(Number(event.target.value))
									}
									disabled={isMutating}
									className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
								/>
								<button
									type="button"
									onClick={() => {
										if (!Number.isFinite(adjustLimitAmount) || adjustLimitAmount < 1) {
											addToast("error", "Limit must be at least 1.");
											return;
										}
										adjustLimitMutation.mutate(adjustLimitAmount);
									}}
									disabled={isMutating}
									className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
								>
									Adjust Limit All
								</button>
							</div>
						</section>

						<UserDetailsPanel
							selectedUserId={selectedUserId}
							userData={selectedUserData}
							isLoading={isUserLoading}
							error={userError ?? null}
							onResetQuota={() => selectedUserId && resetMutation.mutate()}
							onToggleSuspend={(isSuspended) =>
								selectedUserId && toggleSuspendMutation.mutate(isSuspended)
							}
							onAddExtra={(amount) => {
								if (!selectedUserId) {
									return;
								}
								if (!Number.isFinite(amount) || amount < 1) {
									addToast("error", "Amount must be at least 1.");
									return;
								}
								addExtraMutation.mutate(amount);
							}}
							isMutating={isMutating}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
