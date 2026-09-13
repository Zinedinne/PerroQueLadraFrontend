import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
<<<<<<< HEAD
import Navbar from "./components/navbar"; 
import { Toaster } from "sonner"; 
import Script from "next/script";
=======
import Navbar from "./components/navbar";
import { Toaster } from "sonner"; 
>>>>>>> 0616f1925c9f2bcaa55420195b9d60f1ecd92e22

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PERRO QUE LADRA | STORE",
  description: "Streetwear & Events",
  icons: {
    icon: "/icon.png", 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning en html ayuda con extensiones que cambian el tema o atributos
    <html lang="es" suppressHydrationWarning>
<<<<<<< HEAD
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background-dark text-white`}
        // suppressHydrationWarning en body ignora atributos inyectados como cz-shortcut-listen
        suppressHydrationWarning={true}
      >
=======
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background-dark text-white relative`}>
>>>>>>> 0616f1925c9f2bcaa55420195b9d60f1ecd92e22
        <Navbar />
        
<<<<<<< HEAD
        {/* Script de Mercado Pago cargado de forma prioritaria */}
        <Script 
          src="https://sdk.mercadopago.com/js/v2" 
          strategy="beforeInteractive"
        />

        {/* Toaster estilizado para la estética de la marca */}
        <Toaster 
          richColors 
          position="top-center" 
          theme="dark" 
=======
        {/* Contenido principal de las páginas */}
        {children}

        {/* 3. NUEVO: Botón Flotante de Odoo */}
        <a
          href="https://perro-que-ladra.odoo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-primary text-black px-6 py-3 rounded-full font-black uppercase italic shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:scale-105 transition-all duration-300 z-50 border-2 border-primary hover:bg-background-dark hover:text-primary tracking-widest text-xs"
        >
          Visita nuestra tienda
        </a>

        {/* 2. Componente Toaster */}
        <Toaster
          richColors
          position="top-center"
          theme="dark"
>>>>>>> 0616f1925c9f2bcaa55420195b9d60f1ecd92e22
          toastOptions={{
            style: {
              background: '#0a0a0a',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              textTransform: 'uppercase',
              fontSize: '12px',
              fontWeight: '900',
              fontStyle: 'italic'
            },
          }}
        />
      </body>
    </html>
  );
}
