import Constants from "expo-constants";
import { Platform } from "react-native";

// ✅ FORCE PRODUCTION URL - Bỏ qua __DEV__
const PRODUCTION_URL = "https://demobackendb.onrender.com/api";
const USE_PRODUCTION = true; // ← Set true để dùng production

const getApiUrl = () => {
    // Force production
    if (USE_PRODUCTION) {
        return PRODUCTION_URL;
    }

    // Development mode
    if (Platform.OS === "web") {
        return "http://localhost:8080/api";
    }

    if (Platform.OS === "android") {
        const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
        if (!debuggerHost || debuggerHost === "localhost" || debuggerHost === "127.0.0.1") {
            return "http://10.0.2.2:8080/api";
        }
        return `http://${debuggerHost}:8080/api`;
    }

    const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
    if (debuggerHost) {
        return `http://${debuggerHost}:8080/api`;
    }

    return "http://10.61.239.25:8080/api";
};

export const API_BASE_URL = getApiUrl();

// Log để debug
console.log("🌐 API Base URL:", API_BASE_URL);
console.log("📱 Platform:", Platform.OS);
console.log("🔧 Development Mode:", __DEV__);
console.log("🚀 Use Production:", USE_PRODUCTION);
