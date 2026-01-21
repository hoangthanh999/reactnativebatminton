// components/ui/Input.tsx - VERSION FIX
import { Colors } from '@/constants/Colors';
import React, { forwardRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: string;
    rightIcon?: React.ReactNode;
    containerStyle?: ViewStyle;
    isPassword?: boolean;
}

const Input = forwardRef<TextInput, InputProps>(({
    label,
    error,
    icon,
    rightIcon,
    containerStyle,
    isPassword = false,
    ...props
}, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputFocused,
                    error && styles.inputError,
                ]}
            >
                {icon && <Text style={styles.icon}>{icon}</Text>}

                <TextInput
                    ref={ref}
                    style={styles.input}
                    placeholderTextColor={Colors.textSecondary}
                    onFocus={(e) => {
                        setIsFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        props.onBlur?.(e);
                    }}
                    secureTextEntry={isPassword && !showPassword}
                    {...props}
                />

                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.eyeIcon}>
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </Text>
                    </TouchableOpacity>
                )}

                {rightIcon}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
});

Input.displayName = 'Input';

export default Input;

const styles = StyleSheet.create({
    container: {
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
    icon: {
        fontSize: 20,
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        paddingVertical: 0,
        // ✅ THÊM: Đảm bảo input không bị re-render
        height: '100%',
    },
    eyeButton: {
        padding: 8,
        marginLeft: 4,
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
});
