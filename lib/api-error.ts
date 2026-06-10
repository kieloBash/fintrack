import axios from "axios";

export function handleApiError(
    error: unknown,
    context: string
): never {
    if (axios.isAxiosError(error)) {
        console.error(`[${context}]`, {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            response: error.response?.data,
            requestData: error.config?.data,
        });

        throw new Error(
            error.response?.data?.message ??
            error.message ??
            "Request failed"
        );
    }

    console.error(`[${context}]`, error);

    throw error;
}