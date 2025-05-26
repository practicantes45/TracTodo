import { Montserrat, Ubuntu, Prompt, Mina } from 'next/font/google';
import './styles/global.css';

// Configura las fuentes
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

// const notoSans = Noto_Sans({
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-noto-sans',
//   weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
// });


const ubuntu = Ubuntu({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-ubuntu',
  weight: ['300', '400', '500', '700'],
});

const prompt = Prompt({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-prompt',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const mina = Mina({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mina',
  weight: ['400','700'],
});


export const metadata = {
  title: 'Frontend',
  description: 'Sitio del Frontend',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${montserrat.variable} ${ubuntu.variable} ${prompt.variable} ${mina.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}