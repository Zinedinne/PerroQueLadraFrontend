"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); // Estado para mostrar el mensaje de éxito
  
  const router = useRouter();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault(); 
    setLoading(true);

    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

    try {
      const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // En lugar de un alert o redirección inmediata, mostramos el mensaje de éxito
        setIsRegistered(true);
      } else {
        alert("ERROR: " + (data.error?.message || "Hubo un problema"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // PANTALLA DE ÉXITO (Se muestra después de registrarse)
  if (isRegistered) {
    return (
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 bg-background-dark">
        <div className="max-w-md w-full border-2 border-primary p-8 text-center">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-primary mb-4">
            ¡REVISA TU MAIL!
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-white mb-8 leading-relaxed">
            Hemos enviado un código de activación a <span className="text-primary">{email}</span>. 
            Debes confirmarlo para entrar en la jauría.
          </p>
          <div className="space-y-4">
            <Link 
              href="/login" 
              className="block w-full bg-white text-background-dark font-black uppercase italic py-4 hover:bg-primary transition-colors"
            >
              Ir al Login
            </Link>
            <p className="text-[9px] uppercase tracking-widest text-white/30">
              * Revisa tu bandeja de Ethereal para el enlace de prueba.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // FORMULARIO DE REGISTRO NORMAL
  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 bg-background-dark py-12">
      <div className="max-w-md w-full">
        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
            UNIRSE A LA <span className="text-primary">JAURÍA</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-2">
            Crea tu cuenta para acceder a lanzamientos exclusivos
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">Nombre de Usuario</label>
            <input
              type="text" required
              className="w-full bg-white/5 border border-white/10 rounded-none p-4 text-white placeholder:text-white/10 focus:outline-none focus:border-primary uppercase text-xs tracking-widest"
              placeholder="EJ: ZINEDINE_V"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">Correo Electrónico</label>
            <input
              type="email" required
              className="w-full bg-white/5 border border-white/10 rounded-none p-4 text-white placeholder:text-white/10 focus:outline-none focus:border-primary uppercase text-xs tracking-widest"
              placeholder="TU@EMAIL.COM"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 ml-1">Contraseña</label>
            <input
              type="password" required
              className="w-full bg-white/5 border border-white/10 rounded-none p-4 text-white focus:outline-none focus:border-primary normal-case text-xs tracking-widest"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-white text-background-dark font-black uppercase italic py-4 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "VERIFICANDO..." : "CREAR CUENTA AHORA"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            ¿Ya eres parte? <Link href="/login" className="text-primary hover:text-white transition-colors ml-2 font-black">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </main>
  );
}