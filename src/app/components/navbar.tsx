"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Verificamos si hay un token para saber si mostrar el carrito
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  return (
    <nav className="w-full bg-background-dark border-b border-white/5 px-6 md:px-20 py-5 flex justify-between items-center sticky top-0 z-50">
      
      {/* LOGO */}
      <Link href="/" className="text-xl font-black uppercase italic tracking-tighter text-white">
        PERRO QUE <span className="text-primary">LADRA</span>
      </Link>

      <div className="flex items-center gap-8">
        {/* ENLACES NORMALES */}
        <Link 
          href="/productos/catalog" 
          className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
            pathname === "/productos/catalog" ? "text-primary" : "text-white/60 hover:text-primary"
          }`}
        >
          Tienda
        </Link>

        {/* --- NUEVO BOTÓN DE EVENTOS --- */}
        <Link 
          href="/eventos" 
          className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
            pathname === "/eventos" ? "text-primary" : "text-white/60 hover:text-primary"
          }`}
        >
          Eventos
        </Link>

        {/* --- BOTÓN DEL CARRITO --- */}
        {isLoggedIn && (
          <Link href="/carrito" className="relative group flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
              pathname === "/carrito" ? "text-primary" : "text-white group-hover:text-primary"
            }`}>
              Carrito
            </span>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className={`${
                pathname === "/carrito" ? "text-white" : "text-primary group-hover:text-white"
              } transition-colors`}>
                <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Z"></path>
              </svg>
            </div>
          </Link>
        )}

        {/* LOGIN / PERFIL */}
        {!isLoggedIn ? (
          <Link href="/login" className="bg-white text-black px-4 py-2 text-[10px] font-black uppercase italic hover:bg-primary transition-all">
            Entrar
          </Link>
        ) : (
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white transition-colors"
          >
            Salir
          </button>
        )}
      </div>
    </nav>
  );
}