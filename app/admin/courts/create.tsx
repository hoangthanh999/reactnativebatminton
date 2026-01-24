// app/admin/courts/create.tsx
import { Colors } from '@/constants/Colors';
import { decodeToken } from '@/services/authService';
import { cloudinaryService } from '@/services/cloudinaryService';
import { CourtRequest, courtService } from '@/services/courtService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateCourtScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const insets = useSafeAreaInsets();

    // Form state
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [pricePerHour, setPricePerHour] = useState('');
    const [numberOfCourts, setNumberOfCourts] = useState('');
    const [openTime, setOpenTime] = useState('06:00');
    const [closeTime, setCloseTime] = useState('22:00');
    const [images, setImages] = useState<string[]>([]);
    const [facilities, setFacilities] = useState('');

    // Errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = 'Vui lòng nhập tên sân';
        if (!address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
        if (!pricePerHour || Number(pricePerHour) <= 0) {
            newErrors.pricePerHour = 'Giá thuê phải lớn hơn 0';
        }
        if (!numberOfCourts || Number(numberOfCourts) < 1) {
            newErrors.numberOfCourts = 'Số sân phải ít nhất là 1';
        }
        if (!openTime.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
            newErrors.openTime = 'Giờ mở cửa không hợp lệ (HH:mm)';
        }
        if (!closeTime.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
            newErrors.closeTime = 'Giờ đóng cửa không hợp lệ (HH:mm)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePickImage = async () => {
        try {
            const imageUri = await cloudinaryService.pickImage();
            if (imageUri) {
                setImageLoading(true);
                const result = await cloudinaryService.uploadImage(imageUri, 'courts');
                setImages([...images, result.secure_url]);
                setImageLoading(false);
            }
        } catch (error: any) {
            setImageLoading(false);
            Alert.alert('Lỗi', error.message || 'Không thể upload ảnh');
        }
    };

    const handleTakePhoto = async () => {
        try {
            const imageUri = await cloudinaryService.takePhoto();
            if (imageUri) {
                setImageLoading(true);
                const result = await cloudinaryService.uploadImage(imageUri, 'courts');
                setImages([...images, result.secure_url]);
                setImageLoading(false);
            }
        } catch (error: any) {
            setImageLoading(false);
            Alert.alert('Lỗi', error.message || 'Không thể chụp ảnh');
        }
    };

    const handleRemoveImage = (index: number) => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc muốn xóa ảnh này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => {
                        // ✅ Chỉ xóa khỏi state, KHÔNG gọi Cloudinary
                        // Backend sẽ xóa khi court bị xóa hoặc update
                        const newImages = [...images];
                        newImages.splice(index, 1);
                        setImages(newImages);

                        // Note: Ảnh vẫn còn trên Cloudinary cho đến khi:
                        // 1. Court bị xóa → Backend xóa tất cả ảnh
                        // 2. Court được update → Backend xóa ảnh không còn trong list
                    },
                },
            ]
        );
    };

    const handleSubmit = async () => {
        if (!validate()) {
            Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
            return;
        }

        if (images.length === 0) {
            Alert.alert('Lỗi', 'Vui lòng thêm ít nhất 1 ảnh sân');
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            console.log('🔑 Current token:', token?.substring(0, 50) + '...');

            const facilitiesArray = facilities
                .split(',')
                .map(f => f.trim())
                .filter(f => f.length > 0);
            if (token) {
                const decoded = decodeToken(token);
                console.log('📋 Token payload:', decoded);
                console.log('⏰ Token expires at:', new Date(decoded.exp * 1000));
                console.log('🕐 Current time:', new Date());
            }


            const courtData: CourtRequest = {
                name: name.trim(),
                address: address.trim(),
                description: description.trim(),
                pricePerHour: Number(pricePerHour),
                numberOfCourts: Number(numberOfCourts),
                openTime,
                closeTime,
                images,
                facilities: facilitiesArray.length > 0 ? facilitiesArray : undefined,
            };

            const response = await courtService.createCourt(courtData);

            if (response.success) {
                Alert.alert('Thành công', 'Đã tạo sân mới', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            }
        } catch (error: any) {
            console.error('Create court error:', error);
            console.error('Error response:', error.response?.data);
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo sân');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    disabled={loading}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tạo sân mới</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Images Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Hình ảnh sân *</Text>

                        <View style={styles.imagesGrid}>
                            {images.map((imageUrl, index) => (
                                <View key={index} style={styles.imageContainer}>
                                    <Image
                                        source={{ uri: imageUrl }}
                                        style={styles.image}
                                    />
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => handleRemoveImage(index)}
                                    >
                                        <Text style={styles.removeImageIcon}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {images.length < 5 && (
                                <View style={styles.addImageButtons}>
                                    <TouchableOpacity
                                        style={styles.addImageButton}
                                        onPress={handlePickImage}
                                        disabled={imageLoading}
                                    >
                                        {imageLoading ? (
                                            <ActivityIndicator color={Colors.primary} />
                                        ) : (
                                            <>
                                                <Text style={styles.addImageIcon}>🖼️</Text>
                                                <Text style={styles.addImageText}>Thư viện</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.addImageButton}
                                        onPress={handleTakePhoto}
                                        disabled={imageLoading}
                                    >
                                        {imageLoading ? (
                                            <ActivityIndicator color={Colors.primary} />
                                        ) : (
                                            <>
                                                <Text style={styles.addImageIcon}>📷</Text>
                                                <Text style={styles.addImageText}>Chụp ảnh</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <Text style={styles.hint}>Tối đa 5 ảnh</Text>
                    </View>

                    {/* Basic Info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Tên sân *</Text>
                            <TextInput
                                style={[styles.input, errors.name && styles.inputError]}
                                placeholder="VD: Sân Cầu Lông ABC"
                                value={name}
                                onChangeText={(text) => {
                                    setName(text);
                                    if (errors.name) setErrors({ ...errors, name: '' });
                                }}
                                editable={!loading}
                            />
                            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Địa chỉ *</Text>
                            <TextInput
                                style={[styles.input, errors.address && styles.inputError]}
                                placeholder="VD: 123 Nguyễn Huệ, Q1, TP.HCM"
                                value={address}
                                onChangeText={(text) => {
                                    setAddress(text);
                                    if (errors.address) setErrors({ ...errors, address: '' });
                                }}
                                editable={!loading}
                                multiline
                            />
                            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Mô tả</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Mô tả về sân..."
                                value={description}
                                onChangeText={setDescription}
                                editable={!loading}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Pricing & Courts */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Giá & Số sân</Text>

                        <View style={styles.row}>
                            <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Giá thuê (VNĐ/giờ) *</Text>
                                <TextInput
                                    style={[styles.input, errors.pricePerHour && styles.inputError]}
                                    placeholder="100000"
                                    value={pricePerHour}
                                    onChangeText={(text) => {
                                        setPricePerHour(text.replace(/[^0-9]/g, ''));
                                        if (errors.pricePerHour) setErrors({ ...errors, pricePerHour: '' });
                                    }}
                                    keyboardType="numeric"
                                    editable={!loading}
                                />
                                {errors.pricePerHour && (
                                    <Text style={styles.errorText}>{errors.pricePerHour}</Text>
                                )}
                            </View>

                            <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Số sân *</Text>
                                <TextInput
                                    style={[styles.input, errors.numberOfCourts && styles.inputError]}
                                    placeholder="4"
                                    value={numberOfCourts}
                                    onChangeText={(text) => {
                                        setNumberOfCourts(text.replace(/[^0-9]/g, ''));
                                        if (errors.numberOfCourts) setErrors({ ...errors, numberOfCourts: '' });
                                    }}
                                    keyboardType="numeric"
                                    editable={!loading}
                                />
                                {errors.numberOfCourts && (
                                    <Text style={styles.errorText}>{errors.numberOfCourts}</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Operating Hours */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Giờ hoạt động</Text>

                        <View style={styles.row}>
                            <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Giờ mở cửa *</Text>
                                <TextInput
                                    style={[styles.input, errors.openTime && styles.inputError]}
                                    placeholder="06:00"
                                    value={openTime}
                                    onChangeText={(text) => {
                                        setOpenTime(text);
                                        if (errors.openTime) setErrors({ ...errors, openTime: '' });
                                    }}
                                    editable={!loading}
                                />
                                {errors.openTime && (
                                    <Text style={styles.errorText}>{errors.openTime}</Text>
                                )}
                            </View>

                            <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.label}>Giờ đóng cửa *</Text>
                                <TextInput
                                    style={[styles.input, errors.closeTime && styles.inputError]}
                                    placeholder="22:00"
                                    value={closeTime}
                                    onChangeText={(text) => {
                                        setCloseTime(text);
                                        if (errors.closeTime) setErrors({ ...errors, closeTime: '' });
                                    }}
                                    editable={!loading}
                                />
                                {errors.closeTime && (
                                    <Text style={styles.errorText}>{errors.closeTime}</Text>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Facilities */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tiện ích</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="VD: Bãi đậu xe, Phòng thay đồ, Wifi"
                            value={facilities}
                            onChangeText={setFacilities}
                            editable={!loading}
                        />
                        <Text style={styles.hint}>Phân cách bằng dấu phẩy (,)</Text>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, (loading || imageLoading) && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading || imageLoading}
                >
                    {loading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>Tạo sân</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-between', // Removed
        // paddingTop: 60, // Removed, now dynamic
        paddingBottom: 20,
        paddingHorizontal: 24,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 24,
        color: Colors.white,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
    },
    imagesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    imageContainer: {
        position: 'relative',
        width: 100,
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    removeImageButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageIcon: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    addImageButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    addImageButton: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: Colors.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.surface,
    },
    addImageIcon: {
        fontSize: 32,
        marginBottom: 4,
    },
    addImageText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    hint: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 8,
    },
    inputWrapper: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inputError: {
        borderColor: Colors.error,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    errorText: {
        color: Colors.error,
        fontSize: 12,
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    submitButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
