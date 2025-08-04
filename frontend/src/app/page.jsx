'use client';
import './styles/global.css';
import './styles/responsive.css';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarCheck, FaMapMarkedAlt } from "react-icons/fa";
import Navbar from './components/Navbar/Navbar';
import HeroSection from './components/HeroSection/HeroSection';
import ContactNumbers from './components/ContactNumbers/ContactNumbers';
import ProductCarousel from './components/ProductCarousel/ProductCarousel';
import VerMarcas from './components/VerMarcas/VerMarcas';
import BenefitsSection from './components/BenefitsSection/BenefitsSection';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import AdminPanel from './components/AdminPanel/AdminPanel';
import ManageProductsButton from './components/ManageProductsButton/ManageProductsButton';

function HomeContent() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    // Función para manejar clic en marca
    const handleMarcaClick = (marca) => {
        console.log(`🔗 Navegando a productos con marca: ${marca}`);
        router.push(`/productos?marca=${encodeURIComponent(marca)}`);
    };

    // Mapeo de nombres de imagen a nombres de marca (para coincidir con el backend)
    const marcaMapping = {
        'Volvo': 'Volvo',
        'Detroit': 'Detroit',
        'Caterpillar': 'Caterpillar',
        'Mercedes-Benz': 'Mercedes Benz',
        'Cummins': 'Cummins',
        'Navistar': 'Navistar'
    };

    return (
        <div className="layout">
            {/* Navbar principal con estado activo */}
            <Navbar />

            {/* Contenido principal */}
            <main className="mainContent">
                {/* Hero Section con logo y slogan centrados */}
                <HeroSection />

                {/* Números de contacto*/}
                <ContactNumbers pageContext="home" />

                <section className="carouselSection">
                    <ProductCarousel onMarcaClick={handleMarcaClick} marcaMapping={marcaMapping} />
                </section>

                {/* Ver Más Marcas */}
                <VerMarcas />

                {/* Panel de administración - Solo visible para administradores */}
                <AdminPanel />

                {/* Sección de beneficios */}
                <BenefitsSection />

            </main>

            {/* Footer */}
            <Footer />

            {/* Botón ScrollToTop */}
            <ScrollToTop />
        </div>
    );
}

// Componente de fallback para Suspense
function HomePageFallback() {
    return (
        <div className="layout">
            <Navbar />
            <main className="mainContent">
                <div className="loadingContainer">
                    <h2>Cargando...</h2>
                    <div className="spinner"></div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

// Componente principal con Suspense
export default function HomePage() {
    return (
        <Suspense fallback={<HomePageFallback />}>
            <HomeContent />
        </Suspense>
    );
}