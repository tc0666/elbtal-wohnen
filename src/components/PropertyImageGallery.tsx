import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Button } from './ui/button';

interface PropertyImageGalleryProps {
  images: string[];
  title: string;
  className?: string;
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({ 
  images, 
  title, 
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState<Set<number>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  // Filter out failed images
  const validImages = images.filter((_, index) => !failedImages.has(index));
  const currentValidIndex = Math.min(currentIndex, validImages.length - 1);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  const handleImageLoad = (index: number) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleImageError = (index: number) => {
    console.log(`Image ${index + 1} failed to load:`, images[index]);
    setFailedImages(prev => new Set([...prev, index]));
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleImageLoadStart = (index: number) => {
    setLoadingImages(prev => new Set([...prev, index]));
  };

  if (validImages.length === 0) {
    return (
      <div className={`bg-muted rounded-lg flex items-center justify-center h-[400px] ${className}`}>
        <div className="text-center">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Keine Bilder verfügbar</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Image */}
      <div className="relative h-[400px] rounded-lg overflow-hidden bg-muted">
        {validImages.length > 0 && (
          <>
            <img
              src={validImages[currentValidIndex]}
              alt={`${title} - Bild ${currentValidIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
              onLoadStart={() => handleImageLoadStart(currentValidIndex)}
              onLoad={() => handleImageLoad(currentValidIndex)}
              onError={() => handleImageError(currentValidIndex)}
            />
            
            {loadingImages.has(currentValidIndex) && (
              <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </>
        )}

        {/* Navigation Buttons */}
        {validImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {validImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {currentValidIndex + 1} / {validImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {validImages.length > 1 && (
        <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
          {validImages.map((image, index) => {
            const originalIndex = images.findIndex(img => img === image);
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  index === currentValidIndex
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                <img
                  src={image}
                  alt={`${title} - Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(originalIndex)}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PropertyImageGallery;