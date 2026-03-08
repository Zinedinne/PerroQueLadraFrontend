"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Definimos precios = [] por defecto para evitar que sea undefined
export default function BoletoSelector({ evento, precios = [] }: { evento: any; precios: any[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(false);

  // Validación de seguridad extra
  if (!precios || !Array.isArray(precios)) {
    return <p className="text-white/20 italic text-[10px]">Cargando distancias...</p>;
  }

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    const userStorage = localStorage.getItem("user");

    if (!token || !userStorage) {
      alert("Inicia sesión para inscribirte");
      router.push("/login");
      return;
    }

    if (!selectedId) {
      alert("Selecciona la distancia (KM)");
      return;
    }

    const parsedUser = JSON.parse(userStorage);
    const userId = parsedUser.id || parsedUser.user?.id || parsedUser.documentId;
    
    // Buscamos la distancia seleccionada
    const inscripcion = precios.find((p: any) => p.documentId === selectedId);

    setLoading(true);

    try {
      const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

      const payload = {
        data: {
          Cantidad: Number(cantidad),
          Detalle: `BOLETO: ${evento.Nombre} | KM: ${inscripcion?.KM || 'N/A'}`,
          Estado: true,
          Total: Number((inscripcion?.Precio || 0) * cantidad),
          cliente: Number(userId)
        }
      };

      const res = await fetch(`${STRAPI_URL}/api/carritos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error en el servidor");

      alert("✔️ Inscripción añadida");
      window.dispatchEvent(new Event("cart-updated"));
      router.refresh();
    } catch (error: any) {
      alert(`❌ ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="uppercase text-[10px] font-black mb-3 text-white/40 tracking-widest italic">
          Selecciona Distancia
        </p>
        <div className="flex flex-col gap-2">
          {precios.map((p) => (
            <button
              key={p.id || p.documentId}
              type="button"
              onClick={() => setSelectedId(p.documentId)}
              className={`flex justify-between items-center p-4 border-2 transition-all ${
                selectedId === p.documentId
                  ? "border-primary bg-primary/10 text-white"
                  : "border-white/5 bg-white/5 text-white/40 hover:border-white/20"
              }`}
            >
              <span className="font-black uppercase italic text-xs tracking-tighter">
                {p.KM}
              </span>
              <span className="font-black text-primary italic">
                ${p.Precio}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center border-2 border-white/5 bg-zinc-800/50">
        <p className="uppercase text-[9px] font-black px-4 text-white/30 italic">Cantidad</p>
        <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="px-5 py-3 text-white font-bold">-</button>
        <span className="flex-1 text-center font-black text-primary text-lg italic">{cantidad}</span>
        <button onClick={() => setCantidad(cantidad + 1)} className="px-5 py-3 text-white font-bold">+</button>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={loading || !selectedId}
        className="w-full h-16 bg-primary text-black font-black uppercase tracking-[0.2em] italic disabled:opacity-30 active:scale-95 flex items-center justify-center gap-3"
      >
        <span className="material-symbols-outlined font-bold">local_activity</span>
        {loading ? "Cargando..." : "Añadir boletos"}
      </button>
    </div>
  );
}