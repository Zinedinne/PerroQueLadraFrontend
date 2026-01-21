"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      // Si no hay token, lo mandamos al login
      router.replace("/login");
    } else {
      // Si hay token, permitimos ver el contenido
      setAuthorized(true);
    }
  }, [router]);

  // Si no está autorizado, no mostramos nada (evita el parpadeo de la tienda antes de redirigir)
  if (!authorized) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <p className="text-primary font-black uppercase italic animate-pulse">Verificando acceso...</p>
      </div>
    );
  }

  return <>{children}</>;
}