import { supabase } from '../lib/supabase';

export const galleryService = {

    // Fetch all gallery posts ordered by newest first
    async getImages() {
        const { data, error } = await supabase
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Upload file to bucket and insert record into database
    // Added 'date' parameter to match our UI update
    async uploadImage(file, caption, date) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const storagePath = `${fileName}`;

        // 1. Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('gallery')
            .upload(storagePath, file);

        if (uploadError) throw uploadError;

        // 2. Retrieve Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('gallery')
            .getPublicUrl(storagePath);

        // 3. Insert into Supabase Database
        const { data, error: dbError } = await supabase
            .from('gallery')
            .insert([{
                image_url: publicUrl,
                storage_path: storagePath,
                caption: caption,
                created_at: date ? new Date(date).toISOString() : new Date().toISOString() // Override created_at with the admin's chosen date
            }])
            .select();

        if (dbError) throw dbError;
        return data[0];
    },

    // Delete from database and remove file from bucket
    async deleteImage(id, storagePath) {
        // 1. Delete database record
        const { error: dbError } = await supabase
            .from('gallery')
            .delete()
            .eq('id', id);

        if (dbError) throw dbError;

        // 2. Delete file from Supabase Storage
        const { error: storageError } = await supabase.storage
            .from('gallery')
            .remove([storagePath]);

        if (storageError) throw storageError;

        return true;
    },

    // Update existing image record, and optionally replace the file
    async updateImage(id, existingStoragePath, newFile, newCaption, newDate) {
        try {
            let imageUrl = null;
            let storagePath = existingStoragePath;

            // 1. If the user selected a new image to replace the old one
            if (newFile) {
                const fileExt = newFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

                // Upload new file
                const { error: uploadError } = await supabase.storage
                    .from('gallery')
                    .upload(fileName, newFile);

                if (uploadError) throw uploadError;

                // Get new public URL
                const { data: urlData } = supabase.storage
                    .from('gallery')
                    .getPublicUrl(fileName);

                imageUrl = urlData.publicUrl;
                storagePath = fileName;

                // Delete the old file from storage to save space
                if (existingStoragePath) {
                    await supabase.storage.from('gallery').remove([existingStoragePath]);
                }
            }

            // 2. Prepare the data payload to update the database
            const updateData = {
                caption: newCaption,
                created_at: newDate ? new Date(newDate).toISOString() : undefined
            };

            // Only update image columns if a new image was uploaded
            if (imageUrl) {
                updateData.image_url = imageUrl;
                updateData.storage_path = storagePath;
            }

            // 3. Update the database record
            const { data, error: dbError } = await supabase
                .from('gallery')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (dbError) throw dbError;

            return { success: true, data };
        } catch (error) {
            console.error('Error updating image:', error);
            return { success: false, error: error.message };
        }
    }
};