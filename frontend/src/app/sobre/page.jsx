'use client';
import './sobre.css';
import { Suspense } from 'react';
import Navbar from '../components/Navbar/Navbar';
import ContactNumbers from '../components/ContactNumbers/ContactNumbers';
import Footer from '../components/Footer/Footer';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

function SobreContent() {
    return (
        <div className="layout sobre-page">
            <Navbar />

            <main className="mainContent">
                {/* Hero Section */}
                <div className="heroSection">
                    <div className="heroOverlay">
                        <div className="heroContent">
                            <h1>Sobre Nosotros</h1>
                        </div>
                    </div>
                </div>

                {/* Números de contacto - Con contexto específico */}
                <ContactNumbers pageContext="sobre" />

                {/* Sección ¿Quiénes Somos? */}
                <section className="aboutSection">
                    <div className="aboutContainer">
                        <div className="aboutTextContent">
                            <h2>¿QUIÉNES SOMOS?</h2>
                            <p>
                                Somos una empresa 100% mexicana con más de 15 años de experiencia en el mercado, 
                                especializada en la venta de refacciones para motores de diésel, autobuses y autotransporte en general.
                            </p>
                            <p>
                                Nuestra trayectoria nos respalda como líderes en el sector, ofreciendo siempre productos 
                                de la más alta calidad y un servicio excepcional que ha ganado la confianza de miles de clientes 
                                en todo el país.
                            </p>
                            <p>
                                En TRACTODO nos especializamos en brindar soluciones integrales para el mantenimiento 
                                y reparación de vehículos de carga y transporte, contribuyendo al desarrollo y crecimiento 
                                del sector automotriz mexicano.
                            </p>
                        </div>
                        <div className="aboutImageContent">
                            <img 
                                src="https://i.postimg.cc/TPmrSDzQ/tracto-sobre-nosotros.png" 
                                alt="Camión TRACTODO - Sobre Nosotros" 
                                className="aboutTruckImage"
                            />
                        </div>
                    </div>
                </section>

                {/* Sección Misión y Visión */}
                <section className="missionVisionSection">
                    <div className="missionVisionContainer">
                        <div className="missionCard">
                            <h3>MISIÓN</h3>
                            <p>
                                Ofrecer refacciones de motores diésel de la mejor calidad en el mercado, 
                                proporcionando a nuestros clientes una atención personalizada y un trato justo, 
                                con entregas rápidas y seguras. Con una cobertura nacional.
                            </p>
                        </div>
                        <div className="visionCard">
                            <h3>VISIÓN</h3>
                            <p>
                                Ser la proveedora de refacciones a diésel número uno en el centro de la república 
                                y con miras a expandir nuestra presencia en todo el país como líderes en el ramo, 
                                fortaleciendo la relación con los clientes y proveedores a base de confianza, 
                                una capacitación óptima con colaboradores y empleados.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Sección Valores */}
                <section className="valuesSection">
                    <div className="valuesContainer">
                        <h2>VALORES</h2>
                        <div className="valuesGrid">
                            <div className="valueCard">
                                <h4>Trato Justo</h4>
                                <p>Relacionamiento honesto y equitativo con clientes, proveedores y colaboradores.</p>
                            </div>
                            <div className="valueCard">
                                <h4>Atención Personalizada</h4>
                                <p>Soluciones a la medida, adaptadas a las necesidades de cada cliente.</p>
                            </div>
                            <div className="valueCard">
                                <h4>Trabajo en Equipo</h4>
                                <p>Colaboración y respeto mutuo para alcanzar los objetivos comunes.</p>
                            </div>
                            <div className="valueCard">
                                <h4>Confianza</h4>
                                <p>Compromiso cumplido, respaldado por 15 años de experiencia.</p>
                            </div>
                            <div className="valueCard">
                                <h4>Calidad</h4>
                                <p>Productos duraderos y confiables, garantizando el mejor rendimiento.</p>
                            </div>
                            <div className="valueCard">
                                <h4>Seguridad</h4>
                                <p>Empaquetado cuidadoso y entrega segura de nuestros productos.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <ScrollToTop />
        </div>
    );
}

// Componente de fallback para Suspense
function SobrePageFallback() {
    return (
        <div className="layout sobre-page">
            <Navbar />
            <main className="mainContent">
                <div className="heroSection">
                    <div className="heroOverlay">
                        <div className="heroContent">
                            <h1>Sobre Nosotros</h1>
                        </div>
                    </div>
                </div>
                <section className="aboutSection">
                    <div className="aboutContainer">
                        <div className="loadingContainer">
                            <h2>Cargando...</h2>
                            <div className="spinner"></div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}

// Componente principal con Suspense
export default function SobrePage() {
    return (
        <Suspense fallback={<SobrePageFallback />}>
            <SobreContent />
        </Suspense>
    );
}