import React, { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface ProductImageUploadProps {
  images: { thumbnails: (File | string)[], gallery: (File | string)[] };
  onImagesChange: (images: { thumbnails: (File | string)[], gallery: (File | string)[] }) => void;
  maxImages?: number;
  className?: string;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  className,
}) => {
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'thumbnails' | 'gallery') => {
    e.preventDefault();
    setDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files, type);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnails' | 'gallery') => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files, type);
    }
  };

  const handleFiles = (files: File[], type: 'thumbnails' | 'gallery') => {
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        toast.error(`${file.name} is not an image file`);
      }
      return isImage;
    });

    const currentImages = images[type];
    const totalImages = currentImages.length + validFiles.length;

    if (totalImages > maxImages) {
      toast.error(`You can only upload a maximum of ${maxImages} images in total`);
      return;
    }

    const updatedImages = [...currentImages, ...validFiles];
    onImagesChange({
      ...images,
      [type]: updatedImages,
    });
  };

  const removeImage = (index: number, type: 'thumbnails' | 'gallery') => {
    const updatedImages = images[type].filter((_, i) => i !== index);
    onImagesChange({
      ...images,
      [type]: updatedImages,
    });
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Thumbnails Upload */}
        <div>
          <h4 className="font-medium mb-2">Thumbnails</h4>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'thumbnails')}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'thumbnails')}
              className="hidden"
              id="thumbnail-upload"
            />
            <label htmlFor="thumbnail-upload" className="cursor-pointer">
              <p className="text-gray-500">
                Drag & drop thumbnail images here or click to upload
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Max {maxImages} images, formats: JPG, PNG, GIF
              </p>
            </label>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {images.thumbnails.length > 0 ? (
              images.thumbnails.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                    onError={(e) => {
                      console.error(`Thumbnail ${index + 1} failed to load:`, image);
                      e.currentTarget.src = '/placeholder-image.jpg'; // Fallback image
                    }}
                  />
                  <button
                    onClick={() => removeImage(index, 'thumbnails')}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No thumbnails uploaded</p>
            )}
          </div>
        </div>

        {/* Gallery Upload */}
        <div>
          <h4 className="font-medium mb-2">Gallery</h4>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center ${
              dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'gallery')}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'gallery')}
              className="hidden"
              id="gallery-upload"
            />
            <label htmlFor="gallery-upload" className="cursor-pointer">
              <p className="text-gray-500">
                Drag & drop gallery images here or click to upload
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Max {maxImages} images, formats: JPG, PNG, GIF
              </p>
            </label>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {images.gallery.length > 0 ? (
              images.gallery.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                    onError={(e) => {
                      console.error(`Gallery ${index + 1} failed to load:`, image);
                      e.currentTarget.src = '/placeholder-image.jpg'; // Fallback image
                    }}
                  />
                  <button
                    onClick={() => removeImage(index, 'gallery')}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No gallery images uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductImageUpload;