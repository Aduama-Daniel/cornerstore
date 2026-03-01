'use client';

import { useState } from 'react';
import MediaUpload from './MediaUpload';

interface MediaItem {
    url: string;
    type: 'image' | 'video';
}

interface MediaUploadSectionProps {
    mainMedia: MediaItem[];
    additionalMedia: MediaItem[];
    onMainMediaChange: (media: MediaItem[]) => void;
    onAdditionalMediaChange: (media: MediaItem[]) => void;
}

export default function MediaUploadSection({
    mainMedia,
    additionalMedia,
    onMainMediaChange,
    onAdditionalMediaChange
}: MediaUploadSectionProps) {

    const addMainMedia = () => {
        onMainMediaChange([...mainMedia, { url: '', type: 'image' }]);
    };

    const updateMainMedia = (index: number, media: MediaItem) => {
        const newMedia = [...mainMedia];
        newMedia[index] = media;
        onMainMediaChange(newMedia);
    };

    const removeMainMedia = (index: number) => {
        onMainMediaChange(mainMedia.filter((_, i) => i !== index));
    };

    const addAdditionalMedia = () => {
        onAdditionalMediaChange([...additionalMedia, { url: '', type: 'image' }]);
    };

    const updateAdditionalMedia = (index: number, media: MediaItem) => {
        const newMedia = [...additionalMedia];
        newMedia[index] = media;
        onAdditionalMediaChange(newMedia);
    };

    const removeAdditionalMedia = (index: number) => {
        onAdditionalMediaChange(additionalMedia.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-8">
            {/* Main Media Section */}
            <div>
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Main Product Media</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Upload images and videos that will appear in the main product carousel. First item will be the primary display.
                    </p>
                </div>

                <div className="space-y-4">
                    {mainMedia.map((media, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                    Media {index + 1} {index === 0 && '(Primary)'}
                                </span>
                                {mainMedia.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeMainMedia(index)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <MediaUpload
                                currentMedia={media.url ? media : undefined}
                                onUploadComplete={(uploadedMedia) => updateMainMedia(index, uploadedMedia)}
                                label=""
                            />
                        </div>
                    ))}
                </div>

                {mainMedia.length < 5 && (
                    <button
                        type="button"
                        onClick={addMainMedia}
                        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                        + Add Main Media
                    </button>
                )}
            </div>

            {/* Additional Media Section */}
            <div className="border-t border-gray-300 pt-8">
                <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Additional Detail Media</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Upload extra images and videos that will appear in the expandable "More Details" section on the product page.
                    </p>
                </div>

                {additionalMedia.length > 0 ? (
                    <div className="space-y-4">
                        {additionalMedia.map((media, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        Detail Media {index + 1}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => removeAdditionalMedia(index)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <MediaUpload
                                    currentMedia={media.url ? media : undefined}
                                    onUploadComplete={(uploadedMedia) => updateAdditionalMedia(index, uploadedMedia)}
                                    label=""
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">No additional media added yet.</p>
                )}

                <button
                    type="button"
                    onClick={addAdditionalMedia}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                    + Add Detail Media
                </button>
            </div>
        </div>
    );
}
