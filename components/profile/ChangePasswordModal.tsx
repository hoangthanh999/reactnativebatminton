// components/profile/ChangePasswordModal.tsx
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { changePassword } from '@/services/userService';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ChangePasswordModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({ oldPassword: '', newPassword: '', confirmPassword: '' });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleChangePassword = async () => {
        let valid = true;
        const newErrors = { oldPassword: '', newPassword: '', confirmPassword: '' };

        // Validate old password
        if (!oldPassword) {
            newErrors.oldPassword = 'Vui lòng nhập mật khẩu cũ';
            valid = false;
        }

        // Validate new password
        if (!newPassword) {
            newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
            valid = false;
        } else if (newPassword.length < 6) {
            newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
            valid = false;
        } else if (newPassword === oldPassword) {
            newErrors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu cũ';
            valid = false;
        }

        // Validate confirm password
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
            valid = false;
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
            valid = false;
        }

        setErrors(newErrors);
        if (!valid) return;

        setLoading(true);
        try {
            await changePassword({
                oldPassword,
                newPassword,
            });

            const successMessage = 'Đổi mật khẩu thành công!';
            if (Platform.OS === 'web') {
                alert(successMessage);
            } else {
                Alert.alert('Thành công', successMessage);
            }

            handleClose();
        } catch (error: any) {
            console.error('Change password error:', error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.';

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
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>🔐 Đổi mật khẩu</Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={styles.closeButton}
                            disabled={loading}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Body */}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.modalBody}>
                            <Input
                                label="Mật khẩu cũ"
                                icon="🔒"
                                placeholder="Nhập mật khẩu hiện tại"
                                value={oldPassword}
                                onChangeText={(text: string) => {
                                    setOldPassword(text);
                                    if (errors.oldPassword)
                                        setErrors({ ...errors, oldPassword: '' });
                                }}
                                error={errors.oldPassword}
                                isPassword={true}
                                editable={!loading}
                            />

                            <Input
                                label="Mật khẩu mới"
                                icon="🔑"
                                placeholder="Ít nhất 6 ký tự"
                                value={newPassword}
                                onChangeText={(text: string) => {
                                    setNewPassword(text);
                                    if (errors.newPassword)
                                        setErrors({ ...errors, newPassword: '' });
                                }}
                                error={errors.newPassword}
                                isPassword={true}
                                editable={!loading}
                            />

                            <Input
                                label="Xác nhận mật khẩu mới"
                                icon="🔑"
                                placeholder="Nhập lại mật khẩu mới"
                                value={confirmPassword}
                                onChangeText={(text: string) => {
                                    setConfirmPassword(text);
                                    if (errors.confirmPassword)
                                        setErrors({ ...errors, confirmPassword: '' });
                                }}
                                error={errors.confirmPassword}
                                isPassword={true}
                                editable={!loading}
                            />

                            <View style={styles.infoBox}>
                                <Text style={styles.infoIcon}>ℹ️</Text>
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoTitle}>Lưu ý:</Text>
                                    <Text style={styles.infoText}>
                                        • Mật khẩu phải có ít nhất 6 ký tự
                                    </Text>
                                    <Text style={styles.infoText}>
                                        • Mật khẩu mới không được trùng với mật khẩu cũ
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.cancelButton, loading && styles.buttonDisabled]}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>

                        <Button
                            title="Đổi mật khẩu"
                            onPress={handleChangePassword}
                            loading={loading}
                            style={styles.submitButton}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.text,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 20,
        color: Colors.textSecondary,
    },
    modalBody: {
        padding: 20,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        alignItems: 'flex-start',
    },
    infoIcon: {
        fontSize: 20,
        marginRight: 12,
        marginTop: 2,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    infoText: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 20,
        marginBottom: 4,
    },
    modalFooter: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingTop: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    submitButton: {
        flex: 1,
        marginBottom: 0,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
