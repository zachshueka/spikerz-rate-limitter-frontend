export const formatCountdown = (targetTimestamp: number, now: number) => {
	const diffMs = targetTimestamp - now;
	if (diffMs <= 0) {
		return "Now";
	}

	const totalSeconds = Math.ceil(diffMs / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	if (minutes > 0) {
		return `${minutes}m ${seconds}s`;
	}
	return `${seconds}s`;
};

export const formatRelativeTime = (timestamp: number, now: number) => {
	const diffMs = now - timestamp;
	if (diffMs < 0) {
		return "Just now";
	}
	const totalSeconds = Math.floor(diffMs / 1000);
	if (totalSeconds < 5) {
		return "Just now";
	}
	if (totalSeconds < 60) {
		return `${totalSeconds}s ago`;
	}
	const minutes = Math.floor(totalSeconds / 60);
	if (minutes < 60) {
		return `${minutes}m ago`;
	}
	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		return `${hours}h ago`;
	}
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
};
