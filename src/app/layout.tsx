import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar"; 
import { Toaster } from "sonner"; 
import Script from "next/script";

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
    icon: "/icon.png", // Next.js buscará esto en la carpeta pública o raíz de app
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
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background-dark text-white`}
        // suppressHydrationWarning en body ignora atributos inyectados como cz-shortcut-listen
        suppressHydrationWarning={true}
      >
        <Navbar />
        {children}
        
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
