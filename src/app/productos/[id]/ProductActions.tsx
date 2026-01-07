"use client";

import { useEffect, useMemo, useState } from "react";
import { formatManualPrice } from "../../format";

export default function ProductActions({
  producto,
  variantes,
}: {
  producto: any;
  variantes: any[];
}) {
  // Filtramos variantes activas (Usando Activo con A mayúscula según tu log)
  const variantesActivas = useMemo(
    () => (variantes || []).filter((v) => v?.Activo !== false),
    [variantes]
  );

  const [varianteColor, setVarianteColor] = useState<any>(
    variantesActivas[0] || null
  );
  const [tallaSeleccionada, setTallaSeleccionada] = useState<string>("");

  // Si cambia el producto, reseteamos a la primera variante disponible
  useEffect(() => {
    if (variantesActivas.length > 0) {
      setVarianteColor(variantesActivas[0]);
    }
  }, [variantesActivas]);

  // Obtenemos las tallas de la variante actual
  const tallasDisponibles = useMemo(() => {
    if (!varianteColor || !varianteColor.tallas) return [];
    // Ordenamos por el campo "Orden" que viene en tu JSON
    return [...varianteColor.tallas].sort((a, b) => (a.Orden || 0) - (b.Orden || 0));
  }, [varianteColor]);

  if (variantesActivas.length === 0) {
    return <p className="text-primary uppercase font-black italic">Sin stock disponible</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* SELECTOR DE COLOR */}
      <div>
        <p className="uppercase text-[10px] font-black tracking-[0.2em] mb-3 text-white/40">Color</p>
        <div className="flex gap-2">
          {variantesActivas.map((v) => (
            <button
              key={v.id}
              onClick={() => {
                setVarianteColor(v);
                setTallaSeleccionada("");
              }}
              className={`px-4 py-2 border text-[10px] font-black uppercase transition-all ${
                v.id === varianteColor.id
                  ? "border-primary text-primary bg-primary/10"
                  : "border-white/10 text-white/40 hover:border-white/30"
              }`}
            >
              {v.Color} {/* Usamos Color con C mayúscula */}
            </button>
          ))}
        </div>
      </div>

      {/* SELECTOR DE TALLAS */}
      <div>
        <div className="flex justify-between items-end mb-3">
          <p className="uppercase text-[10px] font-black tracking-[0.2em] text-white/40">Talla</p>
          <p className="text-[9px] uppercase font-bold text-white/20">Stock: {varianteColor.Stock} disp.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {tallasDisponibles.map((talla: any) => (
            <button
              key={talla.id}
              onClick={() => setTallaSeleccionada(talla.Nombre)}
              className={`w-12 h-12 border text-xs font-bold transition-all ${
                tallaSeleccionada === talla.Nombre
                  ? "bg-primary border-primary text-black"
                  : "border-white/10 text-white hover:border-primary/50"
              }`}
            >
              {talla.Nombre} {/* Usamos Nombre con N mayúscula */}
            </button>
          ))}
        </div>
      </div>

      {/* BOTÓN DE ACCIÓN */}
      <button
        disabled={!tallaSeleccionada || varianteColor.Stock <= 0}
        className="h-14 bg-primary text-black font-black uppercase tracking-[0.2em] text-sm transition-all disabled:opacity-20 disabled:grayscale active:scale-95"
      >
        {varianteColor.Stock <= 0 
          ? "Agotado" 
          : tallaSeleccionada 
            ? `Añadir al carrito Talla ${tallaSeleccionada}` 
            : "Selecciona tu talla"}
      </button>
    </div>
  );
}