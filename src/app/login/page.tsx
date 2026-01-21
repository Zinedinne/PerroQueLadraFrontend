"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // Email o Usuario
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

    try {
      const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // GUARDAMOS LA SESIÓN
        localStorage.setItem("token", data.jwt);
        localStorage.setItem("user", JSON.stringify(data.user));

        // REDIRECCIÓN A LA TIENDA
        router.push("/productos/catalog");
        router.refresh(); // Refresca para que el Navbar detecte el cambio
      } else {
        // Manejo de errores específicos
        if (data.error?.message === "Your account email is not confirmed") {
          setErrorMsg("ACCESO DENEGADO: CONFIRMA TU CORREO EN ETHEREAL.");
        } else {
          setErrorMsg("CREDENCIALES INVÁLIDAS. REVISA TU USUARIO O PASSWORD.");
        }
      }
    } catch (err) {
      setErrorMsg("ERROR DE CONEXIÓN CON EL SERVIDOR.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 bg-background-dark font-sans">
      <div className="max-w-md w-full">
        
       {/* HEADER LOGO */}
<div className="mb-10">
  <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white">
    {/* Cambia "LOGIN_JAURÍA" por lo que prefieras aquí abajo */}
    ACCESO_<span className="text-primary underline decoration-2 underline-offset-8">JAURÍA</span>
  </h1>
  <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 mt-4">
    Identificación requerida / Protocolo 01
  </p>
</div>

        {/* MENSAJE DE ERROR DINÁMICO */}
        {errorMsg && (
          <div className="bg-red-600 text-white p-4 mb-8 text-[11px] font-black uppercase tracking-widest italic border-l-4 border-white shadow-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* EMAIL / USUARIO */}
          <div className="group space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 group-focus-within:text-primary transition-colors ml-1">
              Email o Usuario
            </label>
            <input
              type="text"
              required
              className="w-full bg-white/5 border border-white/10 rounded-none p-4 text-white placeholder:text-white/10 focus:outline-none focus:border-primary focus:bg-white/10 transition-all uppercase text-xs tracking-widest"
              placeholder="ZINEDINE_V"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="group space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 group-focus-within:text-primary transition-colors ml-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-none p-4 text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all text-xs tracking-widest"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* BOTÓN DE ENTRADA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-white text-background-dark font-black uppercase italic py-5 transition-all duration-300 active:scale-[0.97] disabled:opacity-50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
          >
            {loading ? "VERIFICANDO..." : "ENTRAR AL SISTEMA"}
          </button>
        </form>

        {/* PIE DE PÁGINA / REGISTRO */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            ¿Eres nuevo en la jauría? 
            <Link href="/register" className="text-primary hover:text-white transition-colors ml-2 font-black italic">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}