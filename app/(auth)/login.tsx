import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { login } from '@/services/authService';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
    const { login: setAuthUser } = useAuth();
    const insets = useSafeAreaInsets();
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ emailOrPhone: '', password: '' });
    const [focusedInput, setFocusedInput] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmailOrPhone = (input: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(0|\+84)[0-9]{9}$/;
        return emailRegex.test(input) || phoneRegex.test(input);
    };

    const handleLogin = async () => {
        let valid = true;
        const newErrors = { emailOrPhone: '', password: '' };

        if (!emailOrPhone.trim()) {
            newErrors.emailOrPhone = 'Vui lòng nhập email hoặc số điện thoại';
            valid = false;
        } else if (!validateEmailOrPhone(emailOrPhone.trim())) {
            newErrors.emailOrPhone = 'Email hoặc số điện thoại không hợp lệ';
            valid = false;
        }

        if (!password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
            valid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            valid = false;
        }

        setErrors(newErrors);
        if (!valid) return;

        setLoading(true);

        try {
            console.log('🔵 Starting login...');
            const response = await login(emailOrPhone.trim(), password);
            console.log('✅ LOGIN SUCCESS:', response);

            console.log('🔄 Updating auth context...');
            setAuthUser(response.data.user);

            console.log('🚀 Login complete, navigation should happen automatically');
        } catch (error: any) {
            console.error('❌ LOGIN ERROR:', error);

            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Sai email/số điện thoại hoặc mật khẩu';

            if (Platform.OS === 'web') {
                alert(`Lỗi đăng nhập\n${errorMessage}`);
            } else {
                Alert.alert('Lỗi đăng nhập', errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar style="light" />

            {/* Header với gradient */}
            <LinearGradient
                colors={[Colors.gradient1, Colors.gradient2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>🏸</Text>
                    </View>
                    <Text style={styles.headerTitle}>Chào mừng trở lại</Text>
                    <Text style={styles.headerSubtitle}>
                        Đăng nhập để quản lý sân cầu lông
                    </Text>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: insets.bottom + 20 }
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.formContainer}>
                        {/* Email/Phone Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Email hoặc Số điện thoại</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    focusedInput === 'emailOrPhone' && styles.inputFocused,
                                    errors.emailOrPhone && styles.inputError,
                                ]}
                            >
                                <Text style={styles.inputIcon}>📧</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="your@email.com hoặc 0912345678"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={emailOrPhone}
                                    onChangeText={(text) => {
                                        setEmailOrPhone(text);
                                        if (errors.emailOrPhone)
                                            setErrors({ ...errors, emailOrPhone: '' });
                                    }}
                                    onFocus={() => setFocusedInput('emailOrPhone')}
                                    onBlur={() => setFocusedInput('')}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    editable={!loading}
                                />
                            </View>
                            {errors.emailOrPhone ? (
                                <Text style={styles.errorText}>{errors.emailOrPhone}</Text>
                            ) : null}
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Mật khẩu</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    focusedInput === 'password' && styles.inputFocused,
                                    errors.password && styles.inputError,
                                ]}
                            >
                                <Text style={styles.inputIcon}>🔒</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập mật khẩu"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (errors.password)
                                            setErrors({ ...errors, password: '' });
                                    }}
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput('')}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    editable={!loading}
                                    onSubmitEditing={handleLogin}
                                    returnKeyType="done"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
                                    disabled={loading}
                                >
                                    <Text style={styles.eyeIcon}>
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {errors.password ? (
                                <Text style={styles.errorText}>{errors.password}</Text>
                            ) : null}
                        </View>

                        {/* Forgot Password */}
                        <Link href="/(auth)/forgot-password" asChild>
                            <TouchableOpacity
                                style={styles.forgotPassword}
                                disabled={loading}
                            >
                                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                            </TouchableOpacity>
                        </Link>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            activeOpacity={0.8}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={
                                    loading
                                        ? [Colors.textSecondary, Colors.textSecondary]
                                        : [Colors.gradient1, Colors.gradient2]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.loginButtonGradient}
                            >
                                <Text style={styles.loginButtonText}>
                                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>hoặc</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Login Buttons */}
                        <View style={styles.socialContainer}>
                            <TouchableOpacity
                                style={styles.socialButton}
                                disabled={loading}
                                onPress={() => alert('Tính năng đang phát triển')}
                            >
                                <Text style={styles.socialIcon}>📱</Text>
                                <Text style={styles.socialText}>Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.socialButton}
                                disabled={loading}
                                onPress={() => alert('Tính năng đang phát triển')}
                            >
                                <Text style={styles.socialIcon}>👤</Text>
                                <Text style={styles.socialText}>Facebook</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Register Link */}
                        <View style={styles.registerContainer}>
                            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
                            <Link href="/(auth)/register" asChild>
                                <TouchableOpacity disabled={loading}>
                                    <Text style={styles.registerLink}>Đăng ký ngay</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    icon: {
        fontSize: 40,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
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
        maxWidth: Platform.OS === 'web' ? 500 : '100%',
        width: '100%',
        alignSelf: 'center',
    },
    inputWrapper: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
        paddingHorizontal: 16,
        height: 56,
    },
    inputFocused: {
        borderColor: Colors.primary,
        backgroundColor: Colors.white,
    },
    inputError: {
        borderColor: Colors.error,
    },
    inputIcon: {
        fontSize: 20,
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        paddingVertical: 0,
    },
    eyeButton: {
        padding: 8,
    },
    eyeIcon: {
        fontSize: 20,
    },
    errorText: {
        color: Colors.error,
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        elevation: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    loginButtonDisabled: {
        opacity: 0.6,
    },
    loginButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    loginButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        marginHorizontal: 16,
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    socialContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
        borderRadius: 16,
        paddingVertical: 14,
        gap: 8,
    },
    socialIcon: {
        fontSize: 20,
    },
    socialText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        color: Colors.textSecondary,
        fontSize: 15,
    },
    registerLink: {
        color: Colors.primary,
        fontSize: 15,
        fontWeight: '700',
    },
});