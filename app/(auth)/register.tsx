import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [focusedInput, setFocusedInput] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        return phoneRegex.test(phone);
    };

    const handleRegister = () => {
        let valid = true;
        const newErrors = {
            fullName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        };

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ tên';
            valid = false;
        } else if (formData.fullName.trim().length < 3) {
            newErrors.fullName = 'Họ tên phải có ít nhất 3 ký tự';
            valid = false;
        }

        if (!formData.email) {
            newErrors.email = 'Vui lòng nhập email';
            valid = false;
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
            valid = false;
        }

        if (!formData.phone) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
            valid = false;
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
            valid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
            valid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            valid = false;
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
            valid = false;
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu không khớp';
            valid = false;
        }

        setErrors(newErrors);

        if (valid) {
            Alert.alert(
                'Thành công',
                'Đăng ký tài khoản thành công!',
                [
                    {
                        text: 'Đăng nhập ngay',
                        onPress: () => router.replace('/(auth)/login'),
                    },
                ]
            );
        }
    };

    const updateFormData = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field as keyof typeof errors]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    return (
        <View style={styles.container}>
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
                        <Text style={styles.icon}>✨</Text>
                    </View>
                    <Text style={styles.headerTitle}>Tạo tài khoản mới</Text>
                    <Text style={styles.headerSubtitle}>
                        Bắt đầu hành trình quản lý sân của bạn
                    </Text>
                </View>
            </LinearGradient>

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
                        {/* Full Name */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Họ và tên</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    focusedInput === 'fullName' && styles.inputFocused,
                                    errors.fullName && styles.inputError,
                                ]}
                            >
                                <Text style={styles.inputIcon}>👤</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nguyễn Văn A"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={formData.fullName}
                                    onChangeText={(text) => updateFormData('fullName', text)}
                                    onFocus={() => setFocusedInput('fullName')}
                                    onBlur={() => setFocusedInput('')}
                                    autoCapitalize="words"
                                />
                            </View>
                            {errors.fullName ? (
                                <Text style={styles.errorText}>{errors.fullName}</Text>
                            ) : null}
                        </View>

                        {/* Email */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Email</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    focusedInput === 'email' && styles.inputFocused,
                                    errors.email && styles.inputError,
                                ]}
                            >
                                <Text style={styles.inputIcon}>📧</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="your@email.com"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={formData.email}
                                    onChangeText={(text) => updateFormData('email', text)}
                                    onFocus={() => setFocusedInput('email')}
                                    onBlur={() => setFocusedInput('')}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                />
                            </View>
                            {errors.email ? (
                                <Text style={styles.errorText}>{errors.email}</Text>
                            ) : null}
                        </View>

                        {/* Phone */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Số điện thoại</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    focusedInput === 'phone' && styles.inputFocused,
                                    errors.phone && styles.inputError,
                                ]}
                            >
                                <Text style={styles.inputIcon}>📱</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0912345678"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={formData.phone}
                                    onChangeText={(text) => updateFormData('phone', text)}
                                    onFocus={() => setFocusedInput('phone')}
                                    onBlur={() => setFocusedInput('')}
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>
                            {errors.phone ? (
                                <Text style={styles.errorText}>{errors.phone}</Text>
                            ) : null}
                        </View>

                        {/* Password */}
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
                                    placeholder="Tối thiểu 6 ký tự"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={formData.password}
                                    onChangeText={(text) => updateFormData('password', text)}
                                    onFocus={() => setFocusedInput('password')}
                                    onBlur={() => setFocusedInput('')}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeButton}
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

                        {/* Confirm Password */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Xác nhận mật khẩu</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    focusedInput === 'confirmPassword' && styles.inputFocused,
                                    errors.confirmPassword && styles.inputError,
                                ]}
                            >
                                <Text style={styles.inputIcon}>🔐</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập lại mật khẩu"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={formData.confirmPassword}
                                    onChangeText={(text) => updateFormData('confirmPassword', text)}
                                    onFocus={() => setFocusedInput('confirmPassword')}
                                    onBlur={() => setFocusedInput('')}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeButton}
                                >
                                    <Text style={styles.eyeIcon}>
                                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {errors.confirmPassword ? (
                                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                            ) : null}
                        </View>

                        {/* Register Button */}
                        <TouchableOpacity
                            style={styles.registerButton}
                            onPress={handleRegister}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[Colors.gradient1, Colors.gradient2]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.registerButtonGradient}
                            >
                                <Text style={styles.registerButtonText}>Đăng ký</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Terms */}
                        <Text style={styles.termsText}>
                            Bằng cách đăng ký, bạn đồng ý với{' '}
                            <Text style={styles.termsLink}>Điều khoản dịch vụ</Text> và{' '}
                            <Text style={styles.termsLink}>Chính sách bảo mật</Text>
                        </Text>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Đã có tài khoản? </Text>
                            <Link href="/(auth)/login" asChild>
                                <TouchableOpacity>
                                    <Text style={styles.loginLink}>Đăng nhập ngay</Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
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
    header: {
        paddingTop: 60,
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
    registerButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 16,
        elevation: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    registerButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    registerButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    termsText: {
        textAlign: 'center',
        fontSize: 13,
        color: Colors.textSecondary,
        marginBottom: 24,
        lineHeight: 20,
    },
    termsLink: {
        color: Colors.primary,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: Colors.textSecondary,
        fontSize: 15,
    },
    loginLink: {
        color: Colors.primary,
        fontSize: 15,
        fontWeight: '700',
    },
});
