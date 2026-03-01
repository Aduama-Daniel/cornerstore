'use client';

import { useState } from 'react';

interface MediaUploadProps {
    onUploadComplete: (media: { url: string; type: 'image' | 'video' }) => void;
    currentMedia?: { url: string; type: 'image' | 'video' };
    label?: string;
}

export default function MediaUpload({ onUploadComplete, currentMedia, label = 'Upload Media' }: MediaUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(
        currentMedia || null
    );
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            setError('Please select an image or video file');
            return;
        }

        // Validate file size (100MB max for videos, 10MB for images)
        const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            setError(`File size must be less than ${isVideo ? '100MB' : '10MB'}`);
            return;
        }

        setError(null);
        setUploading(true);

        try {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview({
                    url: reader.result as string,
                    type: isVideo ? 'video' : 'image'
                });
            };
            reader.readAsDataURL(file);

            // Upload to backend
            const formData = new FormData();
            formData.append('file', file);

            const credentials = localStorage.getItem('adminCredentials');
            if (!credentials) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();

            if (data.success && data.data.url) {
                onUploadComplete({
                    url: data.data.url,
                    type: data.data.type || (isVideo ? 'video' : 'image')
                });
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to upload media');
            setPreview(currentMedia || null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>

            <div className="flex items-center gap-4">
                {/* Preview */}
                {preview && (
                    <div className="relative w-24 h-24 border border-gray-300 rounded-md overflow-hidden bg-gray-50">
                        {preview.type === 'video' ? (
                            <video
                                src={preview.url}
                                className="w-full h-full object-cover"
                                muted
                            />
                        ) : (
                            <img
                                src={preview.url}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        )}
                        {preview.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                            </div>
                        )}
                    </div>
                )}

                {/* Upload Button */}
                <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="sr-only"
                        />
                        {uploading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Choose File
                            </>
                        )}
                    </label>
                    {error && (
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        Images (max 10MB) or Videos (max 100MB)
                    </p>
                </div>
            </div>
        </div>
    );
}
