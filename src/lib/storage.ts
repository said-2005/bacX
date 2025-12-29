
// Wait, I am REPLACING the content of storage.ts entirely.

export const uploadFile = async (
    file: File,
    path: string, // This will be used as the public_id
    onProgress?: (progress: number) => void
): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error("Cloudinary configuration is missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        // Cloudinary handles file extensions automatically, but we can preserve the 'path' structure
        // by passing it as public_id. Note: Cloudinary might reject certain characters in public_id.
        // For simplicity and safety, we can rely on Cloudinary's auto-naming if path is complex,
        // but the user's existing paths seem safe (alphanumeric + slashes).
        // Let's sanitize the path basic chars just in case, but keep slashes for folders.
        // Actually, let's try to use the path as provided to maintain folder structure.
        formData.append("public_id", path);

        const xhr = new XMLHttpRequest();

        xhr.open("POST", url);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                const progress = (e.loaded / e.total) * 100;
                onProgress(progress);
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                resolve(response.secure_url);
            } else {
                reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
        };

        xhr.onerror = () => {
            reject(new Error("Upload failed due to a network error."));
        };

        xhr.send(formData);
    });
};
