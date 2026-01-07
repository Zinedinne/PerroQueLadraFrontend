"use client";
import { useState } from "react";

interface EventTabsProps {
  data: {
    detalles?: string;
    distanciaCategorias?: string;
    inscripcionesPrecios?: string; // Mapeado desde InscripcionesYPrecio
    estimulosPremios?: string;
    kitEntrega?: string;
    notasImportantes?: string;
  };
}

export default function EventTabs({ data }: EventTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const sections = [
    { label: "Detalles", content: data.detalles },
    { label: "Distancias y Categoría", content: data.distanciaCategorias },
    { label: "Inscripciones y Precios", content: data.inscripcionesPrecios },
    { label: "Estímulos y Premios", content: data.estimulosPremios },
    { label: "Kit de Entrega", content: data.kitEntrega },
    { label: "Notas Importantes", content: data.notasImportantes },
  ];

  return (
    <div className="w-full">
      {/* MENÚ EN GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12">
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`py-3 px-4 text-[9px] font-black uppercase tracking-widest transition-all rounded-xl border text-center ${
              activeTab === index
                ? "bg-primary border-primary text-black"
                : "bg-transparent border-white/10 text-white/40 hover:border-white/30 hover:text-white"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* ÁREA DE CONTENIDO */}
      <div className="min-h-[300px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-[2px] w-10 bg-primary" />
          <span className="text-primary font-black text-[10px] tracking-[0.5em] uppercase italic">
            // {sections[activeTab].label}
          </span>
        </div>

        {sections[activeTab].content ? (
          <div className="text-base md:text-lg text-white/80 leading-relaxed font-normal whitespace-pre-line max-w-3xl">
            {sections[activeTab].content}
          </div>
        ) : (
          <div className="py-12 border-2 border-dashed border-white/5 rounded-[2rem] flex items-center justify-center">
            <p className="text-white/10 font-black uppercase italic text-xs tracking-widest">
              Información no disponible
            </p>
          </div>
        )}
      </div>
    </div>
  );
}