import AuthHeader from '@/components/auth/AuthHeader';
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
    const [emailSent, setEmailSent] = useState(false);

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
        // Giả lập API call
        setTimeout(() => {
            setLoading(false);
            setEmailSent(true);
        }, 1500);
    };

    if (emailSent) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <AuthHeader
                    icon="✅"
                    title="Kiểm tra email"
                    subtitle="Chúng tôi đã gửi link đặt lại mật khẩu"
                />
                <View style={styles.successContainer}>
                    <Text style={styles.successIcon}>📧</Text>
                    <Text style={styles.successTitle}>Email đã được gửi!</Text>
                    <Text style={styles.successText}>
                        Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
                    </Text>
                    <Text style={styles.emailText}>{email}</Text>

                    <Button
                        title="Quay lại đăng nhập"
                        onPress={() => router.replace('/(auth)/login')}
                        style={styles.backButton}
                    />

                    <TouchableOpacity onPress={() => setEmailSent(false)}>
                        <Text style={styles.resendText}>Không nhận được email? Gửi lại</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <AuthHeader
                icon="🔑"
                title="Quên mật khẩu"
                subtitle="Nhập email để nhận link đặt lại mật khẩu"
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
                            Nhập địa chỉ email bạn đã đăng ký. Chúng tôi sẽ gửi link để đặt lại mật khẩu.
                        </Text>

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
                        />

                        <Button
                            title="Gửi link đặt lại mật khẩu"
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
    successContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 48,
        alignItems: 'center',
    },
    successIcon: {
        fontSize: 80,
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
    },
    successText: {
        fontSize: 15,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 16,
    },
    emailText: {
        fontSize: 16,
        color: Colors.primary,
        fontWeight: '600',
        marginBottom: 32,
    },
    backButton: {
        marginBottom: 16,
        width: '100%',
    },
    resendText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});
