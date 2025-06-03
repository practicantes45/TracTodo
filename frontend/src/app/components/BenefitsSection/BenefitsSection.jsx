import React from 'react';
import styles from './BenefitsSection.module.css';

const BenefitsSection = () => {
  const benefits = [
    {
      id: 1,
      title: "Calidad Garantizada",
      description: "Refacciones de alta calidad, certificadas y probadas para máximo rendimiento.",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M5.8 21L7.4 14L2 9.2L9.2 8.6L12 2L14.8 8.6L22 9.2L18.8 12H18C14.9 12 12.4 14.3 12 17.3L5.8 21M17.8 21.2L22.6 16.4L21.3 15L17.7 18.6L16.2 17L15 18.2L17.8 21.2" />
        </svg>
      )
    },
    {
      id: 2,
      title: "Amplio Stock",
      description: "Amplio inventario de refacciones para las principales marcas ¡Listos para enviar!",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,3L2,12H5V20H19V12H22L12,3M12,8.75A2.25,2.25 0 0,1 14.25,11A2.25,2.25 0 0,1 12,13.25A2.25,2.25 0 0,1 9.75,11A2.25,2.25 0 0,1 12,8.75M7,18V16C7,14.67 9.67,14 12,14C14.33,14 17,14.67 17,16V18H7Z" />
        </svg>
      )
    },
    {
      id: 3,
      title: "Precios Competitivos",
      description: "Precios justos, calidad garantizada ¡El mejor valor para ti!",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
        </svg>
      )
    },
    {
      id: 4,
      title: "Garantía Confiable",
      description: "Respaldo total: Garantía extendida y servicio post-venta de confianza",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
        </svg>
      )
    }
  ];

  return (
    <section className={styles.benefitsSection}>
      {/* NUEVO: Título "¿POR QUÉ ELEGIRNOS?" */}
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>¿POR QUÉ ELEGIRNOS?</h2>
      </div>
      
      <div className={styles.benefitsContainer}>
        {benefits.map((benefit) => (
          <div key={benefit.id} className={styles.cardContainer}>
            <div className={styles.card}>
              <div className={styles.frontContent}>
                <div className={styles.iconContainer}>
                  {benefit.icon}
                </div>
                <p className={styles.benefitTitle}>{benefit.title}</p>
              </div>
              <div className={styles.content}>
                <p className={styles.heading}>{benefit.title}</p>
                <p>{benefit.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BenefitsSection;