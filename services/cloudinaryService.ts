// services/cloudinaryService.ts (FIXED - Secure Version)
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

const CLOUDINARY_CLOUD_NAME = 'dbauc2o8b';
const CLOUDINARY_UPLOAD_PRESET = 'badminton_courts'; // ✅ Unsigned preset

export interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
}

export const cloudinaryService = {
    /**
     * Request camera/gallery permissions
     */
    requestPermissions: async () => {
        if (Platform.OS !== 'web') {
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            const { status: galleryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (cameraStatus !== 'granted' || galleryStatus !== 'granted') {
                throw new Error('Cần cấp quyền truy cập camera và thư viện ảnh');
            }
        }
    },

    /**
     * Pick image from gallery
     */
    pickImage: async (): Promise<string | null> => {
        try {
            await cloudinaryService.requestPermissions();

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                return result.assets[0].uri;
            }

            return null;
        } catch (error) {
            console.error('❌ Pick image error:', error);
            throw error;
        }
    },

    /**
     * Take photo with camera
     */
    takePhoto: async (): Promise<string | null> => {
        try {
            await cloudinaryService.requestPermissions();

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                return result.assets[0].uri;
            }

            return null;
        } catch (error) {
            console.error('❌ Take photo error:', error);
            throw error;
        }
    },

    /**
     * ✅ Upload image to Cloudinary (UNSIGNED - No API Secret)
     */
    uploadImage: async (imageUri: string, folder: string = 'courts'): Promise<CloudinaryUploadResult> => {
        try {
            console.log('📤 Uploading image to Cloudinary (unsigned)...');

            // Create form data
            const formData = new FormData();

            // Get file extension
            const fileExtension = imageUri.split('.').pop() || 'jpg';
            const fileName = `court_${Date.now()}.${fileExtension}`;

            // Append image
            formData.append('file', {
                uri: imageUri,
                type: `image/${fileExtension}`,
                name: fileName,
            } as any);

            // ✅ ONLY unsigned preset and folder - NO API KEY/SECRET
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', folder);

            // Upload to Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Cloudinary error:', errorData);
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const data = await response.json();
            console.log('✅ Image uploaded successfully:', data.secure_url);
            console.log('📝 Public ID:', data.public_id);

            return {
                secure_url: data.secure_url,
                public_id: data.public_id,
                width: data.width,
                height: data.height,
                format: data.format,
            };
        } catch (error) {
            console.error('❌ Upload image error:', error);
            throw error;
        }
    },

    /**
     * ✅ Upload multiple images
     */
    uploadMultipleImages: async (imageUris: string[], folder: string = 'courts'): Promise<CloudinaryUploadResult[]> => {
        try {
            console.log(`📤 Uploading ${imageUris.length} images...`);

            const uploadPromises = imageUris.map(uri =>
                cloudinaryService.uploadImage(uri, folder)
            );

            const results = await Promise.all(uploadPromises);
            console.log(`✅ Uploaded ${results.length} images successfully`);

            return results;
        } catch (error) {
            console.error('❌ Upload multiple images error:', error);
            throw error;
        }
    },

    /**
     * ✅ Get Cloudinary URL with transformations
     */
    getTransformedUrl: (publicId: string, transformations: string = 'w_800,h_600,c_fill'): string => {
        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
    },

    /**
     * ✅ Get thumbnail URL
     */
    getThumbnailUrl: (publicId: string): string => {
        return cloudinaryService.getTransformedUrl(publicId, 'w_300,h_200,c_fill,q_auto');
    },
};
