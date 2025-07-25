import Link from 'next/link';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './blog-post.css';

export default function NotFound() {
  return (
    <div className="blog-post-page">
      <Navbar />
      <main className="mainContent">
        <div className="errorContainer">
          <h2>Artículo no encontrado</h2>
          <p>El artículo que buscas no existe o ha sido removido.</p>
          <div className="errorActions">
            <Link href="/blog" className="backToBlogButton">
              Volver al Blog
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}