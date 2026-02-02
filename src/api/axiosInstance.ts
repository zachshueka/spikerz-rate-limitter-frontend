import axios from "axios";

const baseUrl: string = import.meta.env.VITE_API_BASE_URL;

if (!baseUrl) {
	throw new Error("Missing VITE_API_BASE_URL. Add it to your .env file.");
}

export const axiosInstance = axios.create({
	baseURL: baseUrl,
});
