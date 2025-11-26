import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import './PhotoGallery.css';

interface PhotoGalleryProps {
    photos: string[];
    maxVisible?: number;
}

export default function PhotoGallery({ photos, maxVisible = 4 }: PhotoGalleryProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!photos || photos.length === 0) return null;

    const visiblePhotos = photos.slice(0, maxVisible);
    const remainingCount = photos.length - maxVisible;

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const nextPhoto = () => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    };

    const prevPhoto = () => {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    return (
        <>
            {/* Thumbnail Grid */}
            <div className="photo-gallery">
                {visiblePhotos.map((photo, index) => (
                    <div
                        key={index}
                        className="photo-thumbnail"
                        onClick={() => openLightbox(index)}
                    >
                        <img
                            src={photo}
                            alt={`Photo ${index + 1}`}
                            loading="lazy"
                        />
                        {index === maxVisible - 1 && remainingCount > 0 && (
                            <div className="more-overlay">
                                +{remainingCount}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="photo-lightbox" onClick={closeLightbox}>
                    <button className="lightbox-close" onClick={closeLightbox}>
                        <X size={24} />
                    </button>

                    {photos.length > 1 && (
                        <>
                            <button
                                className="lightbox-nav prev"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    prevPhoto();
                                }}
                            >
                                <ChevronLeft size={32} />
                            </button>

                            <button
                                className="lightbox-nav next"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    nextPhoto();
                                }}
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}

                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={photos[currentIndex]}
                            alt={`Photo ${currentIndex + 1}`}
                        />
                        <div className="lightbox-counter">
                            {currentIndex + 1} / {photos.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
