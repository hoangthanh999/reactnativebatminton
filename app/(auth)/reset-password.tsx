import AuthHeader from '@/components/auth/AuthHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ResetPasswordScreen() {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({ token: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleResetPassword = async () => {
        let valid = true;
        const newErrors = { token: '', newPassword: '', confirmPassword: '' };

        if (!token.trim()) {
            newErrors.token = 'Vui lòng nhập mã xác nhận';
            valid = false;
        }

        if (!newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
            valid = false;
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
            valid = false;
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
            valid = false;
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            valid = false;
        }

        setErrors(newErrors);
        if (!valid) return;

        setLoading(true);
        try {
            const { resetPassword } = await import('@/services/passwordResetService');
            await resetPassword(token.trim(), newPassword);

            const alertMessage = 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.';
            if (Platform.OS === 'web') {
                alert(alertMessage);
            } else {
                Alert.alert('Thành công', alertMessage);
            }
            router.replace('/(auth)/login');
        } catch (error: any) {
            console.error('Reset password error:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Không thể đặt lại mật khẩu. Vui lòng kiểm tra mã xác nhận.';

            if (Platform.OS === 'web') {
                alert(`Lỗi\n${errorMessage}`);
            } else {
                Alert.alert('Lỗi', errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <AuthHeader
                icon="🔐"
                title="Đặt lại mật khẩu"
                subtitle="Nhập mã xác nhận và mật khẩu mới"
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.formContainer}>
                        <Text style={styles.instruction}>
                            Nhập mã xác nhận từ email và mật khẩu mới của bạn.
                        </Text>

                        <Input
                            label="Mã xác nhận"
                            icon="🔑"
                            placeholder="Nhập mã từ email"
                            value={token}
                            onChangeText={(text: string) => {
                                setToken(text);
                                if (errors.token) setErrors({ ...errors, token: '' });
                            }}
                            error={errors.token}
                            autoCapitalize="none"
                        />

                        <Input
                            label="Mật khẩu mới"
                            icon="🔒"
                            placeholder="Ít nhất 6 ký tự"
                            value={newPassword}
                            onChangeText={(text: string) => {
                                setNewPassword(text);
                                if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                            }}
                            error={errors.newPassword}
                            isPassword={true}
                        />

                        <Input
                            label="Xác nhận mật khẩu"
                            icon="🔒"
                            placeholder="Nhập lại mật khẩu mới"
                            value={confirmPassword}
                            onChangeText={(text: string) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                            }}
                            error={errors.confirmPassword}
                            isPassword={true}
                        />

                        <Button
                            title="Đặt lại mật khẩu"
                            onPress={handleResetPassword}
                            loading={loading}
                            style={styles.submitButton}
                        />

                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backToLogin}
                        >
                            <Text style={styles.backToLoginText}>← Quay lại đăng nhập</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
    },
    instruction: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 22,
        marginBottom: 24,
        textAlign: 'center',
    },
    submitButton: {
        marginBottom: 24,
        marginTop: 8,
    },
    backToLogin: {
        alignItems: 'center',
        padding: 12,
    },
    backToLoginText: {
        color: Colors.primary,
        fontSize: 15,
        fontWeight: '600',
    },
});
