import { API_BASE_URL } from "../config/api";

export const testConnection = async () => {
    try {
        console.log("🔍 Testing connection to:", API_BASE_URL);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "OPTIONS",
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log("✅ Connection successful:", response.status);
        return true;
    } catch (error: any) {
        console.error("❌ Connection failed:", error.message);
        return false;
    }
};
