import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";

export const login = async (emailOrPhone: string, password: string) => {
    try {
        console.log("🔐 Attempting login with:", { emailOrPhone });

        const response = await apiClient.post("/auth/login", {
            emailOrPhone,
            password,
        });

        console.log("📥 Login response:", response.data);

        if (response.data.success && response.data.data) {
            const { token, user } = response.data.data;
            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("user", JSON.stringify(user));
            console.log("✅ Login successful, token saved");
            return response.data;
        }

        throw new Error("Invalid response format");
    } catch (error: any) {
        console.error("❌ Login error:", error);

        // Better error messages
        if (error.code === "ECONNABORTED") {
            throw new Error("Timeout - Server không phản hồi");
        }

        if (error.message === "Network Error") {
            throw new Error(
                "Không thể kết nối tới server.\n\n" +
                "Kiểm tra:\n" +
                "1. Backend đã chạy chưa?\n" +
                "2. IP address đúng chưa?\n" +
                "3. Cùng WiFi chưa (nếu dùng thiết bị thật)?"
            );
        }

        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }

        throw error;
    }
};

export const register = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
}) => {
    try {
        console.log("📝 Attempting register with:", {
            ...data,
            password: "***",
        });

        const response = await apiClient.post("/auth/register", data);

        console.log("📥 Register response:", response.data);

        if (response.data.success && response.data.data) {
            const { token, user } = response.data.data;
            await AsyncStorage.setItem("token", token);
            await AsyncStorage.setItem("user", JSON.stringify(user));
            console.log("✅ Register successful, token saved");
            return response.data;
        }

        throw new Error("Invalid response format");
    } catch (error: any) {
        console.error("❌ Register error:", error);

        if (error.code === "ECONNABORTED") {
            throw new Error("Timeout - Server không phản hồi");
        }

        if (error.message === "Network Error") {
            throw new Error("Không thể kết nối tới server");
        }

        if (error.response?.data?.message) {
            throw new Error(error.response.data.message);
        }

        throw error;
    }
};

export const logout = async () => {
    try {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        console.log("✅ Logout successful");
    } catch (error) {
        console.error("❌ Logout error:", error);
    }
};

export const getCurrentUser = async () => {
    try {
        const userStr = await AsyncStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error("❌ Get current user error:", error);
        return null;
    }
};

export const getToken = async () => {
    try {
        return await AsyncStorage.getItem("token");
    } catch (error) {
        console.error("❌ Get token error:", error);
        return null;
    }
};

export const isAuthenticated = async () => {
    const token = await getToken();
    return !!token;
};
export const decodeToken = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('❌ Decode token error:', error);
        return null;
    }
};