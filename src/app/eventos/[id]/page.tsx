import { fetchStrapi } from "./../../lib/strapi";
import { formatManualDate } from "./../../format";
import Link from "next/link";
import Navbar from "./../../components/navbar";
import MediaCarousel from "./../../components/MediaCarousel";
import EventTabs from "./../../components/EventTabs";

export default async function EventoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
  
  const res = await fetchStrapi(`eventos/${id}?populate=*`);
  const evento = res?.data;

  if (!evento) return <div className="text-white text-center py-20 font-black uppercase tracking-widest">Evento no encontrado</div>;

  const todosLosMedios = (Array.isArray(evento.Media) ? evento.Media : [evento.Media]).filter(Boolean);
  
  // URL de Google Maps corregida
  const urlMaps = evento.Ubicacion?.startsWith("http") 
    ? evento.Ubicacion 
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evento.Ubicacion || "")}`;

  return (
    <div className="bg-background-dark min-h-screen text-white font-display pb-20 overflow-x-hidden">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6">
        
        {/* SECCIÓN MULTIMEDIA (CARRUSEL) */}
        <section className="h-[45vh] md:h-[65vh] w-full mt-6 mb-12">
          <MediaCarousel media={todosLosMedios} strapiUrl={STRAPI_URL} />
        </section>

        {/* CABECERA: TÍTULO Y DATOS CLAVE */}
        <header className="flex flex-col items-center text-center mb-16">
          <Link href="/eventos" className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-6 italic hover:text-white transition-colors">
            // Volver a la agenda
          </Link>
          
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight mb-10 max-w-4xl">
            {evento.Nombre}
          </h1>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {/* BOTÓN DE UBICACIÓN ÚNICO */}
            <a href={urlMaps} target="_blank" rel="noopener noreferrer" className="group">
              <div className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                <p className="text-white group-hover:text-black text-[10px] font-black uppercase italic flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  {evento.Ubicacion}
                </p>
              </div>
            </a>

            <div className="text-center">
              <span className="text-[9px] text-white/30 font-black uppercase tracking-widest block mb-1">Fecha</span>
              <p className="text-white text-xs md:text-base font-bold uppercase italic">
                {formatManualDate(evento.FechaInicio)}
              </p>
            </div>

            <div className="text-center">
              <span className="text-[9px] text-white/30 font-black uppercase tracking-widest block mb-1">Horario</span>
              <p className="text-white text-xs md:text-base font-bold uppercase italic">
                {evento.Horario || "07:00 AM"}
              </p>
            </div>
          </div>
        </header>

        {/* CUERPO PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-white/5 pt-12">
          
          <div className="lg:col-span-2">
            <EventTabs data={{
              detalles: evento.Descripcion,
              distanciaCategorias: evento.DistanciasYCategoria, // Nombre exacto de tu campo en Strapi
              inscripcionesPrecios: evento.InscripcionesYPrecio,
              estimulosPremios: evento.EstimulosYPremio,
              kitEntrega: evento.KitsEntrega,
              notasImportantes: evento.NotasImportantesYAdicionales,
            }} />
          </div>

          <aside className="relative">
            <div className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/10 backdrop-blur-md sticky top-28 shadow-2xl">
              {/* STATUS INDICATOR */}
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <p className="text-white/30 text-[9px] uppercase font-black tracking-[0.3em]">Status: Activo</p>
              </div>

              <p className="text-white/20 text-[10px] uppercase font-black mb-1 tracking-widest">Precio</p>
              <p className="text-3xl font-black uppercase italic text-primary mb-8">
                  {evento.Precio || "Gratis"}
              </p>
              
              {evento.UrlInscripcion ? (
                <a 
                  href={evento.UrlInscripcion} 
                  target="_blank" 
                  className="block w-full text-center bg-white text-black font-black uppercase text-[11px] py-5 rounded-xl hover:bg-primary transition-all duration-300 shadow-xl"
                >
                  Registrarse Ahora
                </a>
              ) : (
                <div className="w-full text-center border border-white/5 text-white/10 font-black uppercase text-[10px] py-5 rounded-xl italic">
                  Próximamente
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Perro que ladra © 2026</p>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}