type GlobalControlsProps = {
	adjustLimitAmount: number;
	onAdjustLimitAmountChange: (value: number) => void;
	onAdjustLimitAll: () => void;
	isMutating: boolean;
};

export const GlobalControls = ({
	adjustLimitAmount,
	onAdjustLimitAmountChange,
	onAdjustLimitAll,
	isMutating,
}: GlobalControlsProps) => {
	return (
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
						onAdjustLimitAmountChange(Number(event.target.value))
					}
					disabled={isMutating}
					className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
				/>
				<button
					type="button"
					onClick={onAdjustLimitAll}
					disabled={isMutating}
					className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
				>
					Adjust Limit All
				</button>
			</div>
		</section>
	);
};
