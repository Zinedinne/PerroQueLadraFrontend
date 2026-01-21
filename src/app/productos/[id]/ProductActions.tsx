"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductActions({
  producto,
  variantes,
}: {
  producto: any;
  variantes: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [tallaSeleccionada, setTallaSeleccionada] = useState("");
  const [varianteColor, setVarianteColor] = useState<any>(null);

  const variantesActivas = useMemo(
    () => (variantes || []).filter((v) => v?.Activo !== false),
    [variantes]
  );

  useEffect(() => {
    if (variantesActivas.length > 0 && !varianteColor) {
      setVarianteColor(variantesActivas[0]);
    }
  }, [variantesActivas, varianteColor]);

  const tallasDisponibles = useMemo(() => {
    if (!varianteColor?.tallas) return [];
    return [...varianteColor.tallas].sort(
      (a: any, b: any) => (a.Orden || 0) - (b.Orden || 0)
    );
  }, [varianteColor]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    const userStorage = localStorage.getItem("user");

    if (!token || !userStorage) {
      alert("Inicia sesión para continuar");
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userStorage);
    const userId = parsedUser.id || parsedUser.user?.id || parsedUser.documentId;

    if (!userId) {
      alert("Sesión inválida");
      return;
    }

    if (!tallaSeleccionada) {
      alert("Selecciona talla");
      return;
    }

    setLoading(true);

    try {
      const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

      // CORRECCIÓN DE PAYLOAD:
      // Forzamos IDs numéricos. Para relaciones Many-to-One en Strapi REST,
      // el formato estándar es simplemente el ID.
      const payload = {
      data: {
        Cantidad: Number(cantidad),
        Detalle: `Color: ${varianteColor.Color}, Talla: ${tallaSeleccionada}`,
        Estado: true,
        Total: Number((producto.Precio || 0) * cantidad),
        
        // --- RELACIONES ---
        cliente: Number(userId), // Este ya funciona
        
        // Si 'producto' solo no funciona, Strapi podría estar esperando un arreglo 
        // o el nombre del campo está en plural en el API ID.
        producto: Number(producto.id), 
      }
    };
      console.log("📡 Payload a enviar:", payload);

      const res = await fetch(`${STRAPI_URL}/api/carritos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        // Imprimimos el error exacto para saber si es 'producto' lo que falla
        console.error("❌ Error Strapi detallado:", responseData.error);
        throw new Error(responseData?.error?.message || "Error en la petición");
      }

      alert("✔️ Producto añadido y relacionado correctamente");
      router.refresh();
    } catch (error: any) {
      alert(`❌ ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!varianteColor) return <p className="text-primary italic">Cargando variantes...</p>;

  return (
    <div className="flex flex-col gap-8">
      {/* SECCIÓN COLOR */}
      <div>
        <p className="uppercase text-[10px] font-black mb-3 text-white/40 tracking-widest">Color</p>
        <div className="flex gap-2">
          {variantesActivas.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setVarianteColor(v);
                setTallaSeleccionada("");
                setCantidad(1);
              }}
              className={`px-4 py-2 border text-[10px] font-black uppercase transition-all ${
                v.id === varianteColor?.id 
                  ? "border-primary text-primary bg-primary/10" 
                  : "border-white/10 text-white/40"
              }`}
            >
              {v.Color}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN TALLA */}
      <div>
        <p className="uppercase text-[10px] font-black mb-3 text-white/40 tracking-widest">Talla</p>
        <div className="flex gap-2 flex-wrap">
          {tallasDisponibles.map((talla: any) => (
            <button
              key={talla.id}
              onClick={() => setTallaSeleccionada(talla.Nombre)}
              className={`w-12 h-12 border text-xs font-bold transition-all ${
                tallaSeleccionada === talla.Nombre 
                  ? "bg-primary border-primary text-black" 
                  : "border-white/10 text-white"
              }`}
            >
              {talla.Nombre}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN CANTIDAD */}
      <div>
        <p className="uppercase text-[10px] font-black mb-3 text-white/40 tracking-widest">Cantidad</p>
        <div className="flex items-center border border-white/10 w-fit">
          <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="px-4 py-2 hover:bg-white/5 text-white">-</button>
          <span className="px-6 py-2 font-black text-primary border-x border-white/10">{cantidad}</span>
          <button onClick={() => setCantidad(Math.min(varianteColor?.Stock ?? 1, cantidad + 1))} className="px-4 py-2 hover:bg-white/5 text-white">+</button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={loading || !tallaSeleccionada || (varianteColor?.Stock ?? 0) <= 0}
        className="h-14 bg-primary text-black font-black uppercase tracking-widest disabled:opacity-20 active:scale-95"
      >
        {loading ? "Procesando..." : "Añadir al carrito"}
      </button>
    </div>
  );
}