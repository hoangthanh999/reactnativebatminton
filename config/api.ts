import Constants from "expo-constants";
import { Platform } from "react-native";

const getApiUrl = () => {
    // Web (Chrome)
    if (Platform.OS === "web") {
        return "http://localhost:8080/api";
    }

    // Android Emulator
    if (Platform.OS === "android") {
        // Nếu chạy trên Android Emulator, dùng 10.0.2.2
        const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];

        // Nếu là emulator (localhost hoặc không có debuggerHost)
        if (!debuggerHost || debuggerHost === "localhost" || debuggerHost === "127.0.0.1") {
            return "http://10.0.2.2:8080/api";
        }

        // Nếu là thiết bị thật Android
        return `http://${debuggerHost}:8080/api`;
    }

    // iOS Simulator hoặc thiết bị thật
    const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
    if (debuggerHost) {
        return `http://${debuggerHost}:8080/api`;
    }

    // Fallback - Dùng IP thực của máy tính
    return "http://10.61.239.25:8080/api"; // ← IP của bạn
};

export const API_BASE_URL = getApiUrl();

// Log để debug
console.log("🌐 API Base URL:", API_BASE_URL);
console.log("📱 Platform:", Platform.OS);
if (Constants.expoConfig?.hostUri) {
    console.log("🔗 Debugger Host:", Constants.expoConfig.hostUri);
}
