// services/userService.ts - VERSION ĐẦY ĐỦ
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "./apiClient";

export interface UserProfile {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    role: 'USER' | 'OWNER' | 'ADMIN';
    createdAt: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export const userService = {
    getCurrentUser: async (): Promise<UserProfile | null> => {
        try {
            const userStr = await AsyncStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                console.log('👤 Current user:', user);
                return user;
            }
            console.log('👤 No user found in storage');
            return null;
        } catch (error) {
            console.error('❌ Get current user error:', error);
            return null;
        }
    },

    updateProfile: async (data: Partial<UserProfile>) => {
        try {
            console.log('📤 Updating profile:', data);
            const response = await apiClient.put('/users/profile', data);

            if (response.data.success) {
                await AsyncStorage.setItem("user", JSON.stringify(response.data.data));
                console.log('✅ Profile updated');
            }

            return response.data;
        } catch (error: any) {
            console.error('❌ Update profile error:', error.response?.data || error);
            throw error;
        }
    },

    refreshUserData: async () => {
        try {
            console.log('🔄 Refreshing user data...');
            const response = await apiClient.get('/users/me');

            if (response.data.success) {
                await AsyncStorage.setItem("user", JSON.stringify(response.data.data));
                console.log('✅ User data refreshed');
                return response.data.data;
            }

            return null;
        } catch (error: any) {
            console.error('❌ Refresh user data error:', error.response?.data || error);
            throw error;
        }
    },

    // ✅ THÊM FUNCTION NÀY
    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
        try {
            console.log('📤 Changing password...');
            const response = await apiClient.put('/users/change-password', data);
            console.log('✅ Password changed successfully');
            return response.data;
        } catch (error: any) {
            console.error('❌ Change password error:', error.response?.data || error);
            throw error;
        }
    },
};

// ✅ Export named function để dùng trong component
export const changePassword = userService.changePassword;
