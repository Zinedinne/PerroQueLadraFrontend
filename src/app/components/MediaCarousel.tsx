"use client";

import { useState } from "react";

interface MediaItem {
  url: string;
  mime: string;
  id: number;
}

export default function MediaCarousel({ media, strapiUrl }: { media: MediaItem[], strapiUrl: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!media || media.length === 0) return <div className="h-full w-full bg-zinc-900" />;

  const nextSlide = () => setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));

  return (
    <div className="relative h-full w-full group overflow-hidden rounded-3xl border border-white/5 bg-black">
      {media.map((item, index) => {
        const fullUrl = item.url.startsWith("http") ? item.url : `${strapiUrl}${item.url}`;
        const isVideo = item.mime.startsWith("video/");

        return (
          <div
            key={item.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
          >
            {/* CAPA 1: Fondo borroso para rellenar espacios (opcional pero estético) */}
            {!isVideo && (
              <img
                src={fullUrl}
                className="absolute inset-0 h-full w-full object-cover blur-2xl opacity-30 scale-110"
                alt="background blur"
              />
            )}

            {/* CAPA 2: El contenido real (SIN CORTAR) */}
            <div className="relative h-full w-full flex items-center justify-center">
              {isVideo ? (
                <video
                  src={fullUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="max-h-full max-w-full object-contain shadow-2xl"
                />
              ) : (
                <img
                  src={fullUrl}
                  alt="Evento"
                  className="max-h-full max-w-full object-contain shadow-2xl"
                />
              )}
            </div>
          </div>
        );
      })}

      {/* CONTROLES */}
      {media.length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-primary hover:text-black transition-all">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/40 backdrop-blur-md rounded-full hover:bg-primary hover:text-black transition-all">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}
    </div>
  );
}