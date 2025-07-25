'use client';
import { useState } from 'react';
import { FaPlay, FaTimes } from "react-icons/fa";
import styles from './VideoSection.module.css';

export default function VideoSection({ 
  title, 
  description, 
  videoId, 
  thumbnailUrl,
  className = '',
  titleIcon 
}) {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const openVideoModal = () => {
    setVideoModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeVideoModal = () => {
    setVideoModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <>
      <div className={`${styles.videoSection} ${className}`}>
        <h2>
          {titleIcon && <span className={styles.titleIcon}>{titleIcon}</span>}
          {title}
        </h2>
        <p className={styles.videoDescription}>
          {description}
        </p>

        <div className={styles.youtubeVideoContainer} onClick={openVideoModal}>
          <div className={styles.videoThumbnail}>
            <img 
              src={thumbnailUrl}
              alt={title}
              className={styles.thumbnailImage}
            />
            <div className={styles.playButton}>
              <FaPlay />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Video */}
      {videoModalOpen && (
        <div className={styles.modalOverlay} onClick={closeVideoModal}>
          <div className={styles.videoModal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={closeVideoModal}>
              <FaTimes />
            </button>
            <div className={styles.videoModalContent}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className={styles.modalVideo}
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}