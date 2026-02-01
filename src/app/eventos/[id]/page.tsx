import { fetchStrapi } from "./../../lib/strapi";
import { formatManualDate } from "./../../format";
import Link from "next/link";
import MediaCarousel from "./../../components/MediaCarousel";
import EventTabs from "./../../components/EventTabs";

export default async function EventoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
  
  let evento = null;

  try {
    const res = await fetchStrapi(`eventos/${id}?populate=*`);
    evento = res?.data;
  } catch (error) {
    console.error("Error al obtener el evento de Strapi:", error);
  }

  if (!evento) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white font-display">
        <div className="text-center p-10 border-2 border-white/10 bg-zinc-900">
          <p className="font-black uppercase tracking-[0.3em] italic text-primary mb-4">Error</p>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Evento no disponible</h2>
          <Link href="/eventos" className="mt-6 inline-block text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            Volver a la agenda
          </Link>
        </div>
      </div>
    );
  }

  const todosLosMedios = (Array.isArray(evento.Media) ? evento.Media : [evento.Media]).filter(Boolean);

  return (
    <div className="bg-background-dark min-h-screen text-white font-display pb-20 overflow-x-hidden">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,700,1,0" />

      <main className="max-w-6xl mx-auto px-6">
        
        <section className="h-[45vh] md:h-[65vh] w-full mt-6 mb-12">
          <MediaCarousel media={todosLosMedios} strapiUrl={STRAPI_URL} />
        </section>

        <header className="flex flex-col items-center text-center mb-16">
          <Link href="/eventos" className="text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-6 italic hover:text-white transition-colors">
            // Volver a la agenda
          </Link>
          <h1 className="text-4xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-10 max-w-5xl">
            {evento.Nombre}
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-white/10 pt-12">
          
          <div className="lg:col-span-2">
            <EventTabs data={{
              detalles: evento.Descripcion,
              distanciaCategorias: evento.DistanciasYCategoria,
              inscripcionesPrecios: evento.InscripcionesYPrecio,
              estimulosPremios: evento.EstimulosYPremio,
              kitEntrega: evento.KitsEntrega,
              notasImportantes: evento.NotasImportantesYAdicionales,
            }} />
          </div>

          <aside className="relative">
            <div className="bg-zinc-900 p-8 border-2 border-white/5 sticky top-28 shadow-2xl">
              <div className="mb-8">
                <p className="text-white/20 text-[10px] uppercase font-black mb-1 tracking-widest italic">Precio</p>
                <p className="text-5xl font-black uppercase italic text-primary leading-none">
                  {evento.Precio || "Gratis"}
                </p>
              </div>
              
              {evento.UrlInscripcion ? (
                <a 
                  href={evento.UrlInscripcion} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative block w-full border-2 border-[#25D366] transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center gap-3 py-5 px-4 bg-transparent group-hover:bg-[#25D366] transition-colors duration-300">
                    <span className="material-symbols-outlined text-[#25D366] group-hover:text-black transition-colors duration-300 text-[24px]">
                      {evento.UrlInscripcion.includes('wa.me') || evento.UrlInscripcion.includes('whatsapp') ? 'chat_bubble' : 'app_registration'}
                    </span>
                    <span className="font-black uppercase italic text-[11px] tracking-[0.2em] text-[#25D366] group-hover:text-black transition-colors duration-300">
                      Inscribirme Ahora
                    </span>
                  </div>
                </a>
              ) : (
                <div className="w-full border-2 border-white/10 py-5 px-4 text-center bg-white/5">
                   <span className="font-black uppercase italic text-[11px] tracking-[0.3em] text-white/30">
                      Próximamente
                   </span>
                </div>
              )}

              <div className="mt-12 pt-6 border-t border-white/5 text-center">
                <p className="text-[9px] font-black uppercase text-white/10 tracking-[0.4em] italic">PERRO QUE LADRA © 2026</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}