import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar"; 
import { Toaster } from "sonner"; // <--- 1. Importamos Toaster

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background-dark text-white`}>
        <Navbar />
        {children}
        
        {/* 2. Añadimos el componente Toaster aquí abajo */}
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