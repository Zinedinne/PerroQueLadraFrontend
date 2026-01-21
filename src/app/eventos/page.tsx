import { fetchStrapi } from "../lib/strapi";
import { formatManualDate } from "../format";
import Link from "next/link";

export default async function EventosPage() {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
  
  const response = await fetchStrapi("eventos?populate=*&sort=FechaInicio:asc");
  const eventos = response?.data || [];

  return (
    <div className="min-h-screen bg-background-dark text-white font-display">

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-primary/30 pb-6 gap-4">
          <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
            Próximos <span className="text-primary">Eventos</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
            Agenda 2026 / Perro que ladra
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {eventos.length > 0 ? (
            eventos.map((evento: any) => {
              
              const listaArchivos = [
                ...(Array.isArray(evento.Imagen) ? evento.Imagen : [evento.Imagen]),
                ...(Array.isArray(evento.Media) ? evento.Media : [evento.Media])
              ].filter(Boolean);

              const archivoImagen = listaArchivos.find((archivo: any) => 
                archivo?.mime?.startsWith("image/")
              );

              const imgUrl = archivoImagen?.url 
                ? (archivoImagen.url.startsWith('http') ? archivoImagen.url : `${STRAPI_URL}${archivoImagen.url}`) 
                : "/placeholder-evento.jpg";
              
              return (
                <Link 
                  key={evento.id} 
                  href={`/eventos/${evento.documentId || evento.id}`} 
                  // CAMBIO: h-auto para que crezca y min-h para mantener estética
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 flex flex-col md:flex-row h-auto md:min-h-[280px] transition-all hover:border-primary/50 hover:bg-zinc-900"
                >
                  {/* Imagen - Se ajusta al alto del contenido en desktop */}
                  <div className="w-full md:w-1/3 h-64 md:h-auto overflow-hidden bg-zinc-800 shrink-0">
                    <img 
                      src={imgUrl} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                      alt={evento.Nombre} 
                    />
                  </div>
                  
                  {/* Info del evento - Padding ajustado para que no sature */}
                  <div className="p-6 md:p-10 flex flex-col justify-center flex-1">
                    <span className="text-primary font-black text-xs uppercase tracking-[0.3em] mb-3">
                      {formatManualDate(evento.FechaInicio || evento.Fecha)}
                    </span>
                    
                    <h2 className="text-3xl md:text-4xl font-black uppercase italic leading-[0.9] mb-4 group-hover:text-primary transition-colors">
                      {evento.Nombre}
                    </h2>
                    
                    {/* CAMBIO: line-clamp-3 para dar un poco más de margen antes de cortar */}
                    <p className="text-white/50 text-sm uppercase font-bold tracking-tight mb-6 line-clamp-3">
                      {evento.Lugar} — {evento.Descripcion || "Sin descripción disponible"}
                    </p>
                    
                    <div className="mt-auto text-[10px] font-black uppercase tracking-widest text-primary group-hover:translate-x-2 transition-transform flex items-center gap-2">
                      Ver detalles del evento <span className="text-lg">+</span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="py-20 text-center">
              <p className="text-white/20 font-black uppercase tracking-[0.5em]">No hay eventos programados</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}