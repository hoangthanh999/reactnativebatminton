import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";
import { API_BASE_URL } from "../config/api";

// ✅ Custom config cho Android Emulator
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 35000,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
    // ✅ Thêm config này cho Android
    ...(Platform.OS === 'android' && {
        httpsAgent: undefined,
        proxy: false,
    }),
});

// Request Interceptor
apiClient.interceptors.request.use(
    async (config) => {
        console.log("📤 Request:", config.method?.toUpperCase(), config.url);
        console.log("🔗 Full URL:", config.baseURL + config.url);

        const token = await AsyncStorage.getItem("token");

        const isAuthRequest =
            config.url?.includes("/auth/login") ||
            config.url?.includes("/auth/register");

        if (token && !isAuthRequest) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error("❌ Request Error:", error);
        return Promise.reject(error);
    }
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => {
        console.log("✅ Response:", response.status, response.config.url);
        return response;
    },
    async (error) => {
        console.error("❌ Response Error:", {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
        });

        // Xử lý lỗi 401 (Unauthorized)
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
        }

        return Promise.reject(error);
    }
);

export default apiClient;
