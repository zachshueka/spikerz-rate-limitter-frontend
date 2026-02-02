import { useEffect, useState } from "react";

const ONE_SECOND_MS = 1000;

export const useTimer = () => {
	const [time, setTime] = useState(() => Date.now());

	useEffect(() => {
		const interval = window.setInterval(() => {
			setTime(Date.now());
		}, ONE_SECOND_MS);

		return () => {
			window.clearInterval(interval);
		};
	}, []);

	return time;
};
