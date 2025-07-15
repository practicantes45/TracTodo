'use client';
import { useState } from 'react';
import styles from './AdminLoginButton.module.css';
import AdminLoginModal from '../AdminLoginModal/AdminLoginModal';

export default function AdminLoginButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <button 
        className={styles.hiddenButton}
        onClick={handleClick}
        aria-label="Admin"
        title="Admin Login"
      >
        A
      </button>
      
      {isModalOpen && (
        <AdminLoginModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}