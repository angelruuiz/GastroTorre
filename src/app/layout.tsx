import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RestaurantProvider } from '@/context/RestaurantContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gastrotorre.vercel.app'),
  applicationName: 'GastroTorre',
  title: 'GastroTorre | Guía Gastronómica y Cartas Digitales de Torrelodones',
  description: 'Descubre los mejores restaurantes de Torrelodones (Pueblo y Colonia). Consulta sus cartas digitales con precios, fotos, alérgenos y reserva en 1 clic.',
  keywords: ['Torrelodones', 'Restaurantes Torrelodones', 'Dónde comer Torrelodones', 'Carta digital Torrelodones', 'GastroTorre', 'Torre a la Carta'],
  authors: [{ name: 'GastroTorre' }],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GastroTorre',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'GastroTorre — La Guía Gastronómica de Torrelodones',
    description: 'Cartas digitales, fotos, alérgenos, precios actualizados y reservas directas de los restaurantes de Torrelodones.',
    type: 'website',
    locale: 'es_ES',
    siteName: 'GastroTorre',
    images: [
      {
        url: '/logo-gastrotorre.png',
        width: 1024,
        height: 1024,
        alt: 'GastroTorre - Guía Gastronómica y Cartas Digitales de Torrelodones',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GastroTorre — Guía Gastronómica de Torrelodones',
    description: 'Cartas digitales, fotos, precios actualizados y reservas directas de los restaurantes de Torrelodones.',
    images: ['/logo-gastrotorre.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#252d36',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="bg-slate-100 flex flex-col min-h-screen">
        <RestaurantProvider>
          {/* Mobile phone frame container for ultra clean presentation */}
          <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 min-h-screen shadow-xl flex flex-col relative border-x border-slate-200/60 dark:border-slate-800">
            <Navbar />
            <main className="flex-1 pb-10">{children}</main>
            <Footer />
          </div>
        </RestaurantProvider>
      </body>
    </html>
  );
}
