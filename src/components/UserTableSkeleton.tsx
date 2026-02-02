export const UserTableSkeleton = () => {
	return (
		<div className="space-y-3">
			{Array.from({ length: 6 }).map((_, index) => (
				<div
					key={`skeleton-row-${index}`}
					className="grid grid-cols-[1.2fr_1.2fr_1fr_0.8fr_1fr] items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-4"
				>
					<div className="h-4 w-24 animate-pulse rounded bg-slate-800" />
					<div className="h-4 w-32 animate-pulse rounded bg-slate-800" />
					<div className="h-4 w-20 animate-pulse rounded bg-slate-800" />
					<div className="h-6 w-20 animate-pulse rounded-full bg-slate-800" />
					<div className="h-4 w-24 animate-pulse rounded bg-slate-800" />
				</div>
			))}
		</div>
	);
};
