'use client';
import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import ProductOfTheMonthManager from '../ProductOfTheMonthManager/ProductOfTheMonthManager';
import styles from './ManageProductsButton.module.css';
import { IoSettingsSharp } from "react-icons/io5";

export default function ManageProductsButton() {
  const { isAdmin } = useAuth();
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  if (!isAdmin) return null;

  return (
    <div className={styles.buttonContainer}>
      <button 
        className={styles.manageButton}
        onClick={() => setIsManagerOpen(true)}
        title="Gestionar productos del mes"
      >
       <IoSettingsSharp /> Gestionar Productos del Mes
      </button>

      {isManagerOpen && (
        <ProductOfTheMonthManager
          isOpen={isManagerOpen}
          onClose={() => setIsManagerOpen(false)}
        />
      )}
    </div>
  );
}