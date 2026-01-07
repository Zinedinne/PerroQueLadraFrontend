"use client";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Hook para detectar la página actual

export default function Navbar() {
  const pathname = usePathname();

  // Función para saber si el link está activo
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="w-full bg-background-dark border-b border-white/5 h-20 flex items-center sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-6xl mx-auto w-full px-6 flex justify-between items-center">
        
        {/* LOGO / HOME */}
        <Link href="/" className="group">
          <p className="text-sm font-black uppercase italic tracking-tighter text-white">
            PERRO QUE <span className="text-primary group-hover:text-white transition-colors">LADRA</span>
          </p>
        </Link>

        {/* NAVEGACIÓN DINÁMICA */}
        <div className="flex gap-8">
          <Link 
            href="/eventos" 
            className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${
              isActive("/eventos") ? "text-primary" : "text-white/50 hover:text-white"
            }`}
          >
            Eventos
          </Link>
          
          <Link 
            href="/productos/catalog" 
            className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${
              pathname.includes("/productos") ? "text-primary" : "text-white/50 hover:text-white"
            }`}
          >
            Catálogo
          </Link>
        </div>
      </div>
    </nav>
  );
}