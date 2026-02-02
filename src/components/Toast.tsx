import { useDashboardContext } from "../context/DashboardContext";

export type ToastMessage = {
	id: string;
	type: "success" | "error";
	message: string;
};

const TOAST_STYLES: Record<ToastMessage["type"], string> = {
	success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
	error: "border-rose-500/30 bg-rose-500/10 text-rose-100",
};

export const Toasts = () => {
	const { toasts, dismissToast } = useDashboardContext();

	return (
		<div className="fixed right-6 top-6 z-50 flex w-80 flex-col gap-3">
			{toasts.map((toast) => (
				<div
					key={toast.id}
					className={`rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${TOAST_STYLES[toast.type]}`}
				>
					<div className="flex items-start justify-between gap-3">
						<p>{toast.message}</p>
						<button
							type="button"
							onClick={() => dismissToast(toast.id)}
							className="text-xs text-slate-300 transition hover:text-white"
						>
							Dismiss
						</button>
					</div>
				</div>
			))}
		</div>
	);
};
