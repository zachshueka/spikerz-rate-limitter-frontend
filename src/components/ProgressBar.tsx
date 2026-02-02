type ProgressBarProps = {
	value: number;
	max: number;
};

export const ProgressBar = ({ value, max }: ProgressBarProps) => {
	const safeMax = max > 0 ? max : 1;
	const normalizedValue = Math.max(value, 0);
	const percentage = Math.round((normalizedValue / safeMax) * 100);
	const barPercentage = Math.min(percentage, 100);

	return (
		<div className="space-y-2">
			<div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
				<div
					className="h-full rounded-full bg-emerald-500 transition-all"
					style={{ width: `${barPercentage}%` }}
				/>
			</div>
			<div className="flex justify-between text-xs text-slate-400">
				<span>{percentage}% used</span>
				<span>
					{normalizedValue} / {safeMax}
				</span>
			</div>
		</div>
	);
};
