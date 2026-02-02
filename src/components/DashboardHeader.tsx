import { Gauge } from "lucide-react";

export const DashboardHeader = () => {
	return (
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
					Monitor real-time usage across every client, detect bursts, and issue
					immediate controls without leaving the live feed.
				</p>
			</div>
		</header>
	);
};
