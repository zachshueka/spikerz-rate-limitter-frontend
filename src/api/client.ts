const getApiBaseUrl = () => {
	const baseUrl = import.meta.env.VITE_API_BASE_URL;
	if (!baseUrl) {
		throw new Error("Missing VITE_API_BASE_URL. Add it to your .env file.");
	}
	return baseUrl.replace(/\/+$/, "");
};

type RequestConfig = RequestInit & {
	body?: unknown;
};

export const requestJson = async <T>(
	path: string,
	config: RequestConfig = {},
): Promise<T> => {
	const baseUrl = getApiBaseUrl();
	const headers = new Headers(config.headers);
	headers.set("Accept", "application/json");
	if (config.body !== undefined) {
		headers.set("Content-Type", "application/json");
	}

	const response = await fetch(`${baseUrl}${path}`, {
		...config,
		headers,
		body: config.body !== undefined ? JSON.stringify(config.body) : undefined,
	});

	if (!response.ok) {
		const message = await response
			.text()
			.then((text) => text || response.statusText)
			.catch(() => response.statusText);
		throw new Error(message || "Request failed");
	}

	if (response.status === 204) {
		return undefined as T;
	}

	const text = await response.text();
	if (!text) {
		return undefined as T;
	}

	return JSON.parse(text) as T;
};
