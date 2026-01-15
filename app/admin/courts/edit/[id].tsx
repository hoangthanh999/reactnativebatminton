// app/admin/courts/edit/[id].tsx
import { Colors } from '@/constants/Colors';
import { cloudinaryService } from '@/services/cloudinaryService';
import { Court, CourtRequest, courtService } from '@/services/courtService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
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

export default function EditCourtScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [court, setCourt] = useState<Court | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [pricePerHour, setPricePerHour] = useState('');
    const [numberOfCourts, setNumberOfCourts] = useState('');
    const [openTime, setOpenTime] = useState('');
    const [closeTime, setCloseTime] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [facilities, setFacilities] = useState('');

    // Errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load court data
    useEffect(() => {
        loadCourtData();
    }, [id]);

    const loadCourtData = async () => {
        try {
            setLoading(true);
            const response = await courtService.getCourtById(Number(id));

            if (response.success) {
                const courtData = response.data;
                setCourt(courtData);

                // Populate form
                setName(courtData.name);
                setAddress(courtData.address);
                setDescription(courtData.description || '');
                setPricePerHour(courtData.pricePerHour.toString());
                setNumberOfCourts(courtData.numberOfCourts.toString());
                setOpenTime(courtData.openTime);
                setCloseTime(courtData.closeTime);
                setImages(courtData.images || []);
                setFacilities(courtData.facilities?.join(', ') || '');
            }
        } catch (error: any) {
            console.error('Load court error:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin sân', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } finally {
            setLoading(false);
        }
    };

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
                setUploadingImages(true);
                const result = await cloudinaryService.uploadImage(imageUri, 'courts');
                setImages([...images, result.secure_url]);
                setUploadingImages(false);
            }
        } catch (error: any) {
            setUploadingImages(false);
            Alert.alert('Lỗi', error.message || 'Không thể upload ảnh');
        }
    };

    const handleTakePhoto = async () => {
        try {
            const imageUri = await cloudinaryService.takePhoto();
            if (imageUri) {
                setUploadingImages(true);
                const result = await cloudinaryService.uploadImage(imageUri, 'courts');
                setImages([...images, result.secure_url]);
                setUploadingImages(false);
            }
        } catch (error: any) {
            setUploadingImages(false);
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
                        const newImages = [...images];
                        newImages.splice(index, 1);
                        setImages(newImages);
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
            setSaving(true);

            const facilitiesArray = facilities
                .split(',')
                .map(f => f.trim())
                .filter(f => f.length > 0);

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

            const response = await courtService.updateCourt(Number(id), courtData);

            if (response.success) {
                Alert.alert('Thành công', 'Đã cập nhật sân', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            }
        } catch (error: any) {
            console.error('Update court error:', error);
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật sân');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa sân "${court?.name}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSaving(true);
                            await courtService.deleteCourt(Number(id));
                            Alert.alert('Thành công', 'Đã xóa sân', [
                                { text: 'OK', onPress: () => router.replace('/admin/courts' as any) }
                            ]);
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xóa sân');
                        } finally {
                            setSaving(false);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    disabled={saving}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chỉnh sửa sân</Text>
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    disabled={saving}
                >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
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
                                        disabled={uploadingImages}
                                    >
                                        {uploadingImages ? (
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
                                        disabled={uploadingImages}
                                    >
                                        {uploadingImages ? (
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
                                editable={!saving}
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
                                editable={!saving}
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
                                editable={!saving}
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
                                    editable={!saving}
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
                                    editable={!saving}
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
                                    editable={!saving}
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
                                    editable={!saving}
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
                            editable={!saving}
                        />
                        <Text style={styles.hint}>Phân cách bằng dấu phẩy (,)</Text>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, (saving || uploadingImages) && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={saving || uploadingImages}
                >
                    {saving ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>Lưu thay đổi</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.textSecondary,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 24,
        backgroundColor: Colors.primary,
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
    deleteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteIcon: {
        fontSize: 20,
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
