import { fetchStrapi } from "./../../lib/strapi";
import Link from "next/link";
import MediaCarousel from "./../../components/MediaCarousel";
import EventTabs from "./../../components/EventTabs";
import BoletoSelector from "./../../components/BoletoSelector";

export default async function EventoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
  
  let evento = null;

  try {
    // Traemos el evento con todo su contenido relacionado
    const res = await fetchStrapi(`eventos/${id}?populate=*`);
    evento = res?.data;
  } catch (error) {
    console.error("Error al obtener el evento:", error);
  }

  // Si no hay evento, mostramos un error amigable en lugar de pantalla blanca
  if (!evento) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p className="font-black uppercase italic">Evento no encontrado</p>
      </div>
    );
  }

  // VALIDACIÓN CLAVE: Si evento_precios es undefined, enviamos []
  // Esto evita el error de .map en el componente hijo
  const inscripcionesPorKm = Array.isArray(evento.evento_precios) 
    ? evento.evento_precios 
    : [];

  const todosLosMedios = (Array.isArray(evento.Media) ? evento.Media : [evento.Media]).filter(Boolean);

  return (
    <div className="bg-background-dark min-h-screen text-white font-display pb-20 overflow-x-hidden">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,700,1,0" />

      <main className="max-w-6xl mx-auto px-6">
        <section className="h-[45vh] md:h-[65vh] w-full mt-6 mb-12">
          <MediaCarousel media={todosLosMedios} strapiUrl={STRAPI_URL} />
        </section>

        <header className="flex flex-col items-center text-center mb-16">
          <h1 className="text-4xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-10">
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
              <header className="mb-8">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Inscripciones</h2>
              </header>

              {/* LLAMADA AL COMPONENTE QUE YA TIENES */}
              {/* Aquí pasamos 'precios' ya validado como un Array */}
              <BoletoSelector evento={evento} precios={inscripcionesPorKm} />

              <div className="mt-12 pt-6 border-t border-white/5 text-center">
                <p className="text-[9px] font-black uppercase text-white/10 tracking-[0.4em] italic">
                  PERRO QUE LADRA © 2026
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}