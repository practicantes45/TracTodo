import React from 'react';
import { FaWhatsapp } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import styles from './ContactNumbers.module.css';
import { useWhatsAppContact } from '../../../hooks/useWhatsAppContact';

const ContactNumbers = ({ pageContext = 'home', onSelected, allowSelection }) => {
    const router = useRouter();
    const isSelectable = typeof allowSelection === 'boolean' ? allowSelection : pageContext === 'home';

    const {
        advisors,
        selectedAdvisor,
        selectAdvisor,
        startContact: startAdvisorContact,
        isReady,
    } = useWhatsAppContact({
        allowSelection: isSelectable,
        onRequireSelection: () => {
            router.push('/#asesores');
        },
        getMessage: ({ advisor }) => advisor.generalMessage,
    });

    const handleWhatsAppClick = (event) => {
        if (!selectedAdvisor) {
            router.push('/#asesores');
            return;
        }
        startAdvisorContact({}, event);
    };

    const formatPhoneForDisplay = (phoneNumber) => {
        const localNumber = phoneNumber.substring(3);
        if (localNumber.length === 10) {
            return `${localNumber.substring(0, 3)}-${localNumber.substring(3, 6)}-${localNumber.substring(6, 8)}-${localNumber.substring(8)}`;
        }
        return localNumber;
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map((segment) => segment.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    const getContainerClasses = () => {
        const baseClass = styles.contactNumbers;
        const contextKey = pageContext.charAt(0).toUpperCase() + pageContext.slice(1);
        const contextClass = styles[`contactNumbers${contextKey}`];
        return `${baseClass} ${contextClass || ''}`.trim();
    };

    const selectorTitle = isSelectable ? 'Elige a tu asesor de confianza' : 'Asesores de contacto';
    const selectorSubtitle = isSelectable
        ? 'Guardaremos tu eleccion para que cada compra y consulta se realice con la misma persona.'
        : 'Puedes comunicarte con tu asesor asignado, o elegir uno nuevo desde la pagina principal.';

    return (
        <section className={getContainerClasses()} id="asesores">
            <div className={styles.selectorIntro}>
                <h2>{selectorTitle}</h2>
                <p>{selectorSubtitle}</p>
            </div>

            <div className={styles.advisorGrid}>
                {advisors.map((advisor) => {
                    const isActive = selectedAdvisor && selectedAdvisor.id === advisor.id;
                    const cardClasses = [styles.advisorCard];
                    if (isActive) cardClasses.push(styles.activeCard);
                    if (!isSelectable) cardClasses.push(styles.readonlyCard);

                    const content = (
                        <>
                            <span
                                className={styles.avatar}
                                style={{ background: advisor.accentColor }}
                            >
                                {getInitials(advisor.name)}
                            </span>
                            <span className={styles.advisorName}>{advisor.name}</span>
                            <span className={styles.advisorRole}>{advisor.role}</span>
                            <span className={styles.advisorPhone}>{formatPhoneForDisplay(advisor.phoneNumber)}</span>
                            {isActive && <span className={styles.currentBadge}>Seleccionado</span>}
                        </>
                    );

                    if (isSelectable) {
                        return (
                            <button
                                key={advisor.id}
                                type="button"
                                className={cardClasses.join(' ')}
                                onClick={() => { selectAdvisor(advisor.id); onSelected?.(advisor); }}
                                aria-pressed={isActive}
                                aria-label={`Seleccionar a ${advisor.name} como asesor`}
                            >
                                {content}
                            </button>
                        );
                    }

                    return (
                        <div key={advisor.id} className={cardClasses.join(' ')}>
                            {content}
                        </div>
                    );
                })}
            </div>

            <div className={styles.actionPanel}>
                {selectedAdvisor ? (
                    <>
                        <p className={styles.selectedMessage}>
                            Te atendera <strong className={styles.selectedName}>{selectedAdvisor.name}</strong>, <span className={styles.selectedRole}>{selectedAdvisor.role}</span>. {isSelectable ? 'Si necesitas soporte general, escribele directamente por WhatsApp.' : 'Si deseas cambiar de asesor, hazlo desde la pagina principal.'}
                        </p>
                        <button
                            className={styles.primaryButton}
                            onClick={handleWhatsAppClick}
                            aria-label={`Contactar a ${selectedAdvisor.name} por WhatsApp`}
                        >
                            <span className={styles.phoneIcon}><FaWhatsapp /></span>
                            Contactar por WhatsApp
                        </button>
                    </>
                ) : (
                    isSelectable
                        ? (isReady ? null : (
                            <p className={styles.pendingMessage}>Cargando asesores disponibles...</p>
                        ))
                        : (
                            <p className={styles.pendingMessage}>Selecciona tu asesor desde la pagina principal de TracTodo para continuar por WhatsApp.</p>
                        )
                )}
            </div>
        </section>
    );
};

export default ContactNumbers;

