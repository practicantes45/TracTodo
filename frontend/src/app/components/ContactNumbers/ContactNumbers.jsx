import React from 'react';
import { FaWhatsapp } from "react-icons/fa";
import styles from './ContactNumbers.module.css';

const ContactNumbers = () => {
    const contactList = [
        {
            name: "Alan",
            phoneNumber: "+524272245923",
            message: "Hola Alan, estoy buscando información sobre refacciones de motores diésel y agradecería mucho si pudieras ayudarme con mi duda."
        },
        {
            name: "Laura",
            phoneNumber: "+524272033515",
            message: "Hola Laura, estoy buscando información sobre refacciones de motores diésel y agradecería mucho si pudieras ayudarme con mi duda."
        },
        {
            name: "Oscar",
            phoneNumber: "+524272032672",
            message: "Hola Oscar, estoy buscando información sobre refacciones de motores diésel y agradecería mucho si pudieras ayudarme con mi duda."
        },
        {
            name: "Hugo",
            phoneNumber: "+524424128926",
            message: "Hola Hugo, estoy buscando información sobre refacciones de motores diésel y agradecería mucho si pudieras ayudarme con mi duda."
        }
    ];

    const handleWhatsAppClick = (phoneNumber, message) => {
        // Eliminar cualquier caracter que no sea dígito (+ incluido)
        const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
        
        // Asegurar que comience con 52 (código de México)
        const formattedNumber = cleanPhoneNumber.startsWith('52') 
            ? cleanPhoneNumber 
            : `52${cleanPhoneNumber}`;
        
        // Codificar el mensaje para URL
        const encodedMessage = encodeURIComponent(message);
        
        // Detectar si es móvil
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            typeof navigator !== 'undefined' ? navigator.userAgent : ''
        );
        
        // Usar la URL universal que funciona en la mayoría de casos
        // api.whatsapp.com funciona bien tanto en navegadores móviles como de escritorio
        // y puede redirigir a la app nativa en ambos casos
        const universalUrl = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;
        
        // Abrir en nueva ventana/pestaña
        window.open(universalUrl, '_blank');
    };

    // Función para formatear el número de teléfono para mostrar
    const formatPhoneForDisplay = (phoneNumber) => {
        // Eliminamos el prefijo '+52' para mostrar solo el número local
        const localNumber = phoneNumber.substring(3);
        
        // Verificamos la longitud para formatear correctamente
        if (localNumber.length === 10) { // Números con 10 dígitos (celulares mexicanos)
            return `${localNumber.substring(0, 3)}-${localNumber.substring(3, 6)}-${localNumber.substring(6, 8)}-${localNumber.substring(8)}`;
        } else {
            // Formato genérico para otros casos
            return localNumber;
        }
    };

    return (
        <div className={styles.contactNumbers}>
            {contactList.map((contact, index) => (
                <div key={index} className={styles.tooltipContainer}>
                    <button 
                        className={styles.contactItem} 
                        onClick={() => handleWhatsAppClick(contact.phoneNumber, contact.message)}
                        aria-label={`Contactar a ${contact.name} por WhatsApp`}
                    >
                        <span className={styles.phoneIcon}><FaWhatsapp /></span>
                        <span>{formatPhoneForDisplay(contact.phoneNumber)} ({contact.name})</span>
                    </button>
                    <div className={styles.tooltipText}>¡Comunícate con {contact.name} por WhatsApp!</div>
                </div>
            ))}
        </div>
    );
};

export default ContactNumbers;