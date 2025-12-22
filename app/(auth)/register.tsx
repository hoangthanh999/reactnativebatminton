import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { register } from '@/services/authService';
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

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
    const { login: setAuthUser } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string) => {
        const phoneRegex = /^(0|\+84)[0-9]{9}$/;
        return phoneRegex.test(phone);
    };

    const handleRegister = async () => {
        let valid = true;
        const newErrors = {
            fullName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
        };

        // Validate Full Name
        if (!fullName.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ tên';
            valid = false;
        } else if (fullName.trim().length < 2) {
            newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
            valid = false;
        }

        // Validate Email
        if (!email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
            valid = false;
        } else if (!validateEmail(email.trim())) {
            newErrors.email = 'Email không hợp lệ';
            valid = false;
        }

        // Validate Phone
        if (!phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
            valid = false;
        } else if (!validatePhone(phone.trim())) {
            newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
            valid = false;
        }

        // Validate Password
        if (!password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
            valid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
            valid = false;
        }

        // Validate Confirm Password
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
            valid = false;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            valid = false;
        }

        setErrors(newErrors);
        if (!valid) return;

        setLoading(true);

        try {
            const response = await register({
                fullName: fullName.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password,
            });

            console.log('✅ REGISTER SUCCESS:', response);

            // Cập nhật auth context
            setAuthUser(response.data.user);

            // Router sẽ tự động redirect nhờ useEffect trong _layout.tsx
            console.log('🚀 Auth updated, waiting for redirect...');
        } catch (error: any) {
            console.error('❌ REGISTER ERROR:', error);

            const errorMessage =
                error.response?.data?.message || error.message || 'Đã có lỗi xảy ra';

            if (Platform.OS === 'web') {
                alert(`Lỗi đăng ký\n${errorMessage}`);
            } else {
                Alert.alert('Lỗi đăng ký', errorMessage);
            }
        } finally {
            setLoading(false);
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
                        <Text style={styles.icon}>🏸</Text>
                    </View>
                    <Text style={styles.headerTitle}>Tạo tài khoản mới</Text>
                    <Text style={styles.headerSubtitle}>
                        Đăng ký để bắt đầu quản lý sân cầu lông
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
                        {/* Full Name Input */}
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
                                    value={fullName}
                                    onChangeText={(text) => {
                                        setFullName(text);
                                        if (errors.fullName)
                                            setErrors({ ...errors, fullName: '' });
                                    }}
                                    onFocus={() => setFocusedInput('fullName')}
                                    onBlur={() => setFocusedInput('')}
                                    autoCapitalize="words"
                                    editable={!loading}
                                />
                            </View>
                            {errors.fullName ? (
                                <Text style={styles.errorText}>{errors.fullName}</Text>
                            ) : null}
                        </View>

                        {/* Email Input */}
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
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (errors.email) setErrors({ ...errors, email: '' });
                                    }}
                                    onFocus={() => setFocusedInput('email')}
                                    onBlur={() => setFocusedInput('')}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    editable={!loading}
                                />
                            </View>
                            {errors.email ? (
                                <Text style={styles.errorText}>{errors.email}</Text>
                            ) : null}
                        </View>

                        {/* Phone Input */}
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
                                    value={phone}
                                    onChangeText={(text) => {
                                        setPhone(text);
                                        if (errors.phone) setErrors({ ...errors, phone: '' });
                                    }}
                                    onFocus={() => setFocusedInput('phone')}
                                    onBlur={() => setFocusedInput('')}
                                    keyboardType="phone-pad"
                                    autoComplete="tel"
                                    editable={!loading}
                                />
                            </View>
                            {errors.phone ? (
                                <Text style={styles.errorText}>{errors.phone}</Text>
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

                        {/* Confirm Password Input */}
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Xác nhận mật khẩu</Text>
                            <View
                                style={[
                                    styles.inputContainer,
                                    focusedInput === 'confirmPassword' && styles.inputFocused,
                                    errors.confirmPassword && styles.inputError,
                                ]}
                            >
                                <Text style={styles.inputIcon}>🔒</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập lại mật khẩu"
                                    placeholderTextColor={Colors.textSecondary}
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        if (errors.confirmPassword)
                                            setErrors({ ...errors, confirmPassword: '' });
                                    }}
                                    onFocus={() => setFocusedInput('confirmPassword')}
                                    onBlur={() => setFocusedInput('')}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    editable={!loading}
                                    onSubmitEditing={handleRegister}
                                    returnKeyType="done"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeButton}
                                    disabled={loading}
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
                            style={[
                                styles.registerButton,
                                loading && styles.registerButtonDisabled,
                            ]}
                            onPress={handleRegister}
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
                                style={styles.registerButtonGradient}
                            >
                                <Text style={styles.registerButtonText}>
                                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Đã có tài khoản? </Text>
                            <Link href="/(auth)/login" asChild>
                                <TouchableOpacity disabled={loading}>
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
        paddingTop: Platform.OS === 'web' ? 40 : 60,
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
        paddingBottom: Platform.OS === 'web' ? 40 : 20,
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
    registerButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 24,
        elevation: 4,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    registerButtonDisabled: {
        opacity: 0.6,
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
