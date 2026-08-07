import { useState, useEffect, useCallback } from 'react';
import { galleryService } from '../services/galleryService';

export function useGallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    // Memoized fetch function
    const fetchImages = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await galleryService.getImages();
            setImages(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Automatically fetch images when the hook is first used
    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    // Wrapper for upload service
    const addImage = async (file, caption, date) => {
        setUploading(true);
        setError(null);
        try {
            const newImage = await galleryService.uploadImage(file, caption, date);
            // Prepend the new image to the existing array in state
            setImages((prevImages) => [newImage, ...prevImages]);
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setUploading(false);
        }
    };

    // Wrapper for delete service
    const removeImage = async (id, storagePath) => {
        setError(null);
        try {
            await galleryService.deleteImage(id, storagePath);
            // Filter out the deleted image from the array in state
            setImages((prevImages) => prevImages.filter(img => img.id !== id));
            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Wrapper for update service
    const updateImage = async (id, existingStoragePath, newFile, newCaption, newDate) => {
        setUploading(true);
        setError(null);
        try {
            const result = await galleryService.updateImage(id, existingStoragePath, newFile, newCaption, newDate);

            if (result.success) {
                // Update the local state so the UI reflects the changes instantly
                setImages(prevImages =>
                    prevImages.map(img => img.id === id ? result.data : img)
                );
                return { success: true };
            } else {
                setError(result.error);
                return { success: false, error: result.error };
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setUploading(false);
        }
    };

    return {
        images,
        loading,
        uploading,
        error,
        addImage,
        removeImage,
        updateImage,
        refreshImages: fetchImages
    };
}