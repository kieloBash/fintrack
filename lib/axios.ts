import axios from "axios";

export const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error", {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            response: error.response?.data,
        });

        return Promise.reject(error);
    }
);