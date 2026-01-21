// app/(auth)/forgot-password.tsx - VERSION FIX
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleResetPassword = async () => {
        if (!email) {
            setError('Vui lòng nhập email');
            return;
        }

        if (!validateEmail(email)) {
            setError('Email không hợp lệ');
            return;
        }

        setLoading(true);
        try {
            const { forgotPassword } = await import('@/services/passwordResetService');
            await forgotPassword(email);

            // ✅ THAY ĐỔI: Chuyển sang màn hình reset-password
            router.push('/(auth)/reset-password');
        } catch (error: any) {
            console.error('Forgot password error:', error);
            // Vẫn cho chuyển màn hình (vì backend trả về success dù email không tồn tại)
            router.push('/(auth)/reset-password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <Text style={styles.headerIcon}>🔑</Text>
                        <Text style={styles.headerTitle}>Quên mật khẩu?</Text>
                        <Text style={styles.headerSubtitle}>
                            Nhập email để nhận mã xác nhận
                        </Text>
                    </View>

                    <View style={styles.formCard}>
                        <Input
                            label="Email"
                            icon="📧"
                            placeholder="your@email.com"
                            value={email}
                            onChangeText={(text: string) => {
                                setEmail(text);
                                if (error) setError('');
                            }}
                            error={error}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            returnKeyType="send"
                            onSubmitEditing={handleResetPassword}
                            editable={!loading}
                        />

                        <View style={styles.infoBox}>
                            <Text style={styles.infoIcon}>ℹ️</Text>
                            <Text style={styles.infoText}>
                                Chúng tôi sẽ gửi mã xác nhận đến email của bạn. Vui lòng kiểm tra cả thư mục Spam.
                            </Text>
                        </View>

                        <Button
                            title="Gửi mã xác nhận"
                            onPress={handleResetPassword}
                            loading={loading}
                            style={styles.button}
                        />

                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                            disabled={loading}
                        >
                            <Text style={styles.backText}>← Quay lại đăng nhập</Text>
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
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    headerIcon: {
        fontSize: 60,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    formCard: {
        backgroundColor: Colors.white,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        alignItems: 'flex-start',
    },
    infoIcon: {
        fontSize: 20,
        marginRight: 12,
        marginTop: 2,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    button: {
        marginBottom: 16,
    },
    backButton: {
        alignItems: 'center',
        padding: 12,
    },
    backText: {
        color: Colors.primary,
        fontSize: 15,
        fontWeight: '600',
    },
});
