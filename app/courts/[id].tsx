// app/courts/[id].tsx
import { Colors } from '@/constants/Colors';
import { BookingRequest, bookingService } from '@/services/bookingService';
import { Court, courtService } from '@/services/courtService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CourtDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [court, setCourt] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    // Booking form
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedCourtNumber, setSelectedCourtNumber] = useState(1);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('10:00');
    const [notes, setNotes] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    const loadCourtDetail = useCallback(async () => {
        try {
            setLoading(true);
            const response = await courtService.getCourtById(Number(id));

            if (response.success) {
                setCourt(response.data);
            }
        } catch (error: any) {
            console.error('Load court detail error:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin sân');
            router.back();
        } finally {
            setLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        loadCourtDetail();
    }, [loadCourtDetail]);

    const calculateTotalPrice = () => {
        if (!court) return 0;

        const start = parseInt(startTime.split(':')[0]);
        const end = parseInt(endTime.split(':')[0]);
        const hours = end - start;

        return hours > 0 ? hours * court.pricePerHour : 0;
    };

    // Validate time format
    const isValidTimeFormat = (time: string): boolean => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    };

    // Check if time is in the past (for today)
    const isTimeInPast = (date: Date, time: string): boolean => {
        const now = new Date();
        const selectedDateTime = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        selectedDateTime.setHours(hours, minutes, 0, 0);

        // Reset now to start of minute for fair comparison
        now.setSeconds(0, 0);

        return selectedDateTime < now;
    };

    // Check if time is within court operating hours
    const isWithinOperatingHours = (time: string): boolean => {
        if (!court) return true;

        const [hours] = time.split(':').map(Number);
        const [openHour] = court.openTime.split(':').map(Number);
        const [closeHour] = court.closeTime.split(':').map(Number);

        return hours >= openHour && hours < closeHour;
    };

    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (date) {
            // Reset time to start of day for comparison
            const newDate = new Date(date);
            newDate.setHours(0, 0, 0, 0);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (newDate >= today) {
                setSelectedDate(date);

                // If selecting today, validate current time
                if (newDate.getTime() === today.getTime()) {
                    const now = new Date();
                    const currentHour = now.getHours();
                    const startHour = parseInt(startTime.split(':')[0]);

                    // If start time is in the past, set to next available hour
                    if (startHour <= currentHour) {
                        const nextHour = currentHour + 1;
                        setStartTime(`${nextHour.toString().padStart(2, '0')}:00`);
                        setEndTime(`${(nextHour + 2).toString().padStart(2, '0')}:00`);
                    }
                }
            } else {
                Alert.alert('Lỗi', 'Không thể chọn ngày trong quá khứ');
            }
        }
    };

    const handleBooking = async () => {
        if (!court) {
            Alert.alert('Lỗi', 'Thông tin sân không hợp lệ');
            return;
        }

        console.log('🔵 Starting booking process...');
        console.log('Court:', court.id, court.name);
        console.log('Date:', selectedDate.toISOString().split('T')[0]);
        console.log('Time:', startTime, '-', endTime);

        // Validation 1: Check time format
        if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
            Alert.alert('Lỗi', 'Định dạng giờ không hợp lệ. Vui lòng nhập theo định dạng HH:mm (ví dụ: 08:00)');
            return;
        }

        // Validation 2: Check if date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);

        if (selected < today) {
            Alert.alert('Lỗi', 'Không thể đặt sân cho ngày trong quá khứ');
            return;
        }

        // Validation 3: Check if time is in the past (for today)
        if (selected.getTime() === today.getTime()) {
            if (isTimeInPast(selectedDate, startTime)) {
                Alert.alert('Lỗi', 'Không thể đặt sân cho giờ đã qua');
                return;
            }
        }

        // Validation 4: Parse time
        const startHour = parseInt(startTime.split(':')[0]);
        const startMinute = parseInt(startTime.split(':')[1]);
        const endHour = parseInt(endTime.split(':')[0]);
        const endMinute = parseInt(endTime.split(':')[1]);

        const startTotalMinutes = startHour * 60 + startMinute;
        const endTotalMinutes = endHour * 60 + endMinute;

        if (endTotalMinutes <= startTotalMinutes) {
            Alert.alert('Lỗi', 'Giờ kết thúc phải sau giờ bắt đầu');
            return;
        }

        // Validation 5: Minimum booking duration (1 hour)
        const durationMinutes = endTotalMinutes - startTotalMinutes;
        if (durationMinutes < 60) {
            Alert.alert('Lỗi', 'Thời gian đặt sân tối thiểu là 1 giờ');
            return;
        }

        // Validation 6: Check operating hours
        if (!isWithinOperatingHours(startTime) || !isWithinOperatingHours(endTime)) {
            Alert.alert(
                'Lỗi',
                `Sân chỉ hoạt động từ ${court.openTime} đến ${court.closeTime}`
            );
            return;
        }



        try {
            setBooking(true);
            console.log('🟢 Validation passed, creating booking...');

            const bookingData: BookingRequest = {
                courtId: court.id,
                courtNumber: selectedCourtNumber,
                bookingDate: selectedDate.toISOString().split('T')[0],
                startTime: startTime,
                endTime: endTime,

                notes: notes.trim() || undefined,
            };

            console.log('📤 Booking data:', bookingData);

            const response = await bookingService.createBooking(bookingData);

            console.log('📥 Booking response:', response);

            if (response.success) {
                Alert.alert(
                    'Thành công! 🎉',
                    'Đặt sân thành công! Vui lòng thanh toán để hoàn tất.',
                    [
                        {
                            text: 'Xem booking',
                            onPress: () => {
                                router.back();
                                // Navigate to bookings tab
                                setTimeout(() => {
                                    router.push('/(tabs)/bookings' as any);
                                }, 100);
                            },
                        },
                        {
                            text: 'Đóng',
                            style: 'cancel',
                            onPress: () => router.back(),
                        },
                    ]
                );
            }
        } catch (error: any) {
            console.error('❌ Booking error:', error);
            console.error('Error response:', error.response?.data);

            const errorMessage = error.response?.data?.message
                || error.message
                || 'Không thể đặt sân. Vui lòng thử lại.';

            Alert.alert('Lỗi đặt sân', errorMessage);
        } finally {
            setBooking(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Đang tải thông tin sân...</Text>
            </View>
        );
    }

    if (!court) {
        return null;
    }

    const isToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);
        return selected.getTime() === today.getTime();
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Image */}
                <View style={styles.imageContainer}>
                    {court.images && court.images.length > 0 ? (
                        <Image source={{ uri: court.images[0] }} style={styles.image} />
                    ) : (
                        <View style={[styles.image, styles.placeholderImage]}>
                            <Text style={styles.placeholderIcon}>🏸</Text>
                        </View>
                    )}
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                </View>

                {/* Info */}
                <View style={styles.content}>
                    <Text style={styles.name}>{court.name}</Text>
                    <Text style={styles.address}>📍 {court.address}</Text>

                    <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Giá thuê</Text>
                            <Text style={styles.infoValue}>
                                {court.pricePerHour.toLocaleString('vi-VN')}đ/giờ
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Số sân</Text>
                            <Text style={styles.infoValue}>{court.numberOfCourts} sân</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Giờ mở cửa</Text>
                            <Text style={styles.infoValue}>
                                {court.openTime} - {court.closeTime}
                            </Text>
                        </View>
                    </View>

                    {court.description && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Mô tả</Text>
                            <Text style={styles.description}>{court.description}</Text>
                        </View>
                    )}

                    {/* Booking Form */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Đặt sân</Text>

                        {/* Date */}
                        {Platform.OS === 'web' ? (
                            // 🌐 WEB
                            <View style={styles.input}>
                                <Text style={styles.inputLabel}>Ngày đặt *</Text>
                                <input
                                    type="date"
                                    value={selectedDate.toISOString().split('T')[0]}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        const newDate = new Date(e.target.value);
                                        if (!isNaN(newDate.getTime())) {
                                            setSelectedDate(newDate);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        fontSize: '16px',
                                        border: 'none',
                                        backgroundColor: 'transparent',
                                        color: Colors.text,
                                        fontFamily: 'inherit',
                                    }}
                                />
                                {isToday() && (
                                    <Text style={styles.todayBadge}>Hôm nay</Text>
                                )}
                            </View>
                        ) : (
                            // 📱 MOBILE (Android / iOS)
                            <>
                                <TouchableOpacity
                                    style={styles.input}
                                    onPress={() => setShowDatePicker(true)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.inputLabel}>Ngày đặt *</Text>
                                    <View style={styles.dateValueContainer}>
                                        <Text style={styles.inputValue}>
                                            {selectedDate.toLocaleDateString('vi-VN', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Text>
                                        <Text style={styles.calendarIcon}>📅</Text>
                                    </View>
                                    {isToday() && (
                                        <Text style={styles.todayBadge}>Hôm nay</Text>
                                    )}
                                </TouchableOpacity>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        minimumDate={new Date()}
                                        onChange={handleDateChange}
                                        locale="vi-VN"
                                    />
                                )}

                                {Platform.OS === 'ios' && showDatePicker && (
                                    <View style={styles.iosPickerButtons}>
                                        <TouchableOpacity
                                            style={styles.iosPickerButton}
                                            onPress={() => setShowDatePicker(false)}
                                        >
                                            <Text style={styles.iosPickerButtonText}>Xong</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}


                        {Platform.OS === 'ios' && showDatePicker && (
                            <View style={styles.iosPickerButtons}>
                                <TouchableOpacity
                                    style={styles.iosPickerButton}
                                    onPress={() => setShowDatePicker(false)}
                                >
                                    <Text style={styles.iosPickerButtonText}>Xong</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Court Number */}
                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Chọn số sân *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {Array.from({ length: court.numberOfCourts }, (_, i) => i + 1).map((num) => (
                                    <TouchableOpacity
                                        key={num}
                                        style={[
                                            styles.courtNumberChip,
                                            selectedCourtNumber === num && styles.courtNumberChipActive,
                                        ]}
                                        onPress={() => setSelectedCourtNumber(num)}
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.courtNumberText,
                                                selectedCourtNumber === num && styles.courtNumberTextActive,
                                            ]}
                                        >
                                            Sân {num}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Time */}
                        <View style={styles.timeRow}>
                            <View style={[styles.input, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.inputLabel}>Giờ bắt đầu *</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={startTime}
                                    onChangeText={setStartTime}
                                    placeholder="08:00"
                                    placeholderTextColor={Colors.textSecondary}
                                    keyboardType="numbers-and-punctuation"
                                    maxLength={5}
                                />
                                <Text style={styles.timeHint}>VD: 08:00</Text>
                            </View>
                            <View style={[styles.input, { flex: 1, marginLeft: 8 }]}>
                                <Text style={styles.inputLabel}>Giờ kết thúc *</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={endTime}
                                    onChangeText={setEndTime}
                                    placeholder="10:00"
                                    placeholderTextColor={Colors.textSecondary}
                                    keyboardType="numbers-and-punctuation"
                                    maxLength={5}
                                />
                                <Text style={styles.timeHint}>VD: 10:00</Text>
                            </View>
                        </View>

                        {/* Time warning for today */}
                        {isToday() && (
                            <View style={styles.warningBox}>
                                <Text style={styles.warningIcon}>⚠️</Text>
                                <Text style={styles.warningText}>
                                    Lưu ý: Không thể đặt sân cho giờ đã qua
                                </Text>
                            </View>
                        )}

                        {/* Notes */}
                        <View style={styles.input}>
                            <Text style={styles.inputLabel}>Ghi chú (tùy chọn)</Text>
                            <TextInput
                                style={styles.textArea}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Nhập ghi chú cho chủ sân..."
                                placeholderTextColor={Colors.textSecondary}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Total Price */}
                        <View style={styles.totalContainer}>
                            <View>
                                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                                <Text style={styles.durationText}>
                                    ({Math.max(0, parseInt(endTime.split(':')[0]) - parseInt(startTime.split(':')[0]))} giờ)
                                </Text>
                            </View>
                            <Text style={styles.totalPrice}>
                                {calculateTotalPrice().toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Book Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.bookButton, booking && styles.bookButtonDisabled]}
                    onPress={handleBooking}
                    disabled={booking}
                    activeOpacity={0.8}
                >
                    {booking ? (
                        <View style={styles.bookingLoading}>
                            <ActivityIndicator color={Colors.white} />
                            <Text style={[styles.bookButtonText, { marginLeft: 12 }]}>
                                Đang xử lý...
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.bookButtonText}>Đặt sân ngay 🏸</Text>
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
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.textSecondary,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 300,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        backgroundColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderIcon: {
        fontSize: 64,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    backIcon: {
        fontSize: 24,
        color: Colors.text,
    },
    content: {
        padding: 24,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 8,
    },
    address: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        textAlign: 'center',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    input: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 8,
        fontWeight: '600',
    },
    inputValue: {
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
        flex: 1,
    },
    dateValueContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    calendarIcon: {
        fontSize: 20,
    },
    todayBadge: {
        marginTop: 8,
        fontSize: 12,
        color: Colors.primary,
        fontWeight: '600',
    },
    iosPickerButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 12,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        marginBottom: 12,
    },
    iosPickerButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: Colors.primary,
        borderRadius: 8,
    },
    iosPickerButtonText: {
        color: Colors.white,
        fontWeight: '600',
    },
    courtNumberChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.background,
        marginRight: 8,
        borderWidth: 2,
        borderColor: Colors.border,
    },
    courtNumberChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    courtNumberText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    courtNumberTextActive: {
        color: Colors.white,
    },
    timeRow: {
        flexDirection: 'row',
    },
    timeInput: {
        fontSize: 18,
        color: Colors.text,
        fontWeight: '600',
        paddingVertical: 8,
    },
    timeHint: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3CD',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    warningIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#856404',
    },
    textArea: {
        fontSize: 14,
        color: Colors.text,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.primaryLight,
        padding: 16,
        borderRadius: 12,
        marginTop: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    durationText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    totalPrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    bookButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    bookButtonDisabled: {
        opacity: 0.6,
    },
    bookingLoading: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bookButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.white,
    },
});
