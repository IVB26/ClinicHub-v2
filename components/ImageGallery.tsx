'use client';

import { useState, useEffect } from 'react';

interface ImageGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export function ImageGallery({
  images: initialImages,
  onChange,
  disabled = false,
  maxImages = 100,
}: ImageGalleryProps) {
  const [images, setImages] = useState<string[]>(initialImages);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const validMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];

    files.forEach(file => {
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidExt = validExts.includes(fileExt || '');
      const isValidMime = validMimes.includes(file.type);

      if ((isValidExt || isValidMime) && images.length < maxImages) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          setImages(prev => {
            const updated = [...prev, dataUrl];
            onChange(updated);
            return updated;
          });
        };
        reader.onerror = () => {
          alert(`Failed to read file: ${file.name}`);
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <label className="inline-block">
        <span className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 text-sm font-medium inline-flex items-center gap-2 transition">
          📸 Add Images
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
            onChange={handleImageUpload}
            disabled={disabled || images.length >= maxImages}
            className="hidden"
          />
        </span>
      </label>

      {/* Image Count */}
      {images.length > 0 && (
        <p className="text-sm font-medium text-gray-700">
          Images ({images.length}/{maxImages})
        </p>
      )}

      {/* Gallery Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative group overflow-hidden rounded-lg bg-gray-100"
            >
              <img
                src={img}
                alt={`Gallery ${i + 1}`}
                className="w-full h-20 object-cover transition-transform group-hover:scale-105"
              />
              {!disabled && (
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  title="Remove image"
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">
            No images yet. Click "Add Images" to upload.
          </p>
        </div>
      )}

      {/* Max Images Warning */}
      {images.length >= maxImages && (
        <p className="text-sm text-orange-600 font-medium">
          Maximum images ({maxImages}) reached
        </p>
      )}
    </div>
  );
}
