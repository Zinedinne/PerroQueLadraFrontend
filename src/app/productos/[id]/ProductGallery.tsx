"use client"; // <--- Importante para la interactividad

import { useState } from "react";

export default function ProductGallery({ imagenes, nombre, STRAPI_URL }: any) {
  const [selectedImg, setSelectedImg] = useState(0);

  const getImgUrl = (img: any) => {
    const path = img?.url || img?.attributes?.url;
    if (!path) return "https://via.placeholder.com/800x800?text=No+Image";
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return path.startsWith('http') ? path : `${STRAPI_URL}${cleanPath}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* IMAGEN PRINCIPAL */}
      <div className="w-full aspect-square rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl">
        <img 
          src={getImgUrl(imagenes[selectedImg])} 
          className="w-full h-full object-cover transition-all duration-500" 
          alt={nombre} 
        />
      </div>

      {/* MINIATURAS */}
      <div className="grid grid-cols-4 gap-4">
        {imagenes.map((img: any, idx: number) => (
          <button
            key={img.id || idx}
            onClick={() => setSelectedImg(idx)}
            className={`aspect-square rounded-lg border overflow-hidden bg-zinc-900 transition-all ${
              selectedImg === idx 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-white/5 opacity-60 hover:opacity-100"
            }`}
          >
            <img 
              src={getImgUrl(img)} 
              className="w-full h-full object-cover" 
              alt={`Miniatura ${idx}`} 
            />
          </button>
        ))}
      </div>
    </div>
  );
}