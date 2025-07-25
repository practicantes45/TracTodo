'use client';
import { useState } from 'react';

const ImageWithFallback = ({ 
    src, 
    alt, 
    className, 
    fallbackText = "Imagen no encontrada",
    ...props 
}) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    if (imageError || !src) {
        return (
            <div className={`imageNotFound ${className}`} {...props}>
                <div className="imageNotFoundText">{fallbackText}</div>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={handleImageError}
            {...props}
        />
    );
};

export default ImageWithFallback;