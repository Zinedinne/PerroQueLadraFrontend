import { fetchStrapi } from "../../lib/strapi";
import MediaCarousel from "./../../components/MediaCarousel";
import EventTabs from "./../../components/EventTabs";
import FormularioInscripcion from "./../../components/FormularioInscripcion";

export default async function EventoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
  
  let evento = null;

  try {
    // IMPORTANTE: populate=* para traer Media, evento_precios y demás relaciones
    const res = await fetchStrapi(`eventos/${id}?populate=*`);
    evento = res?.data;
  } catch (error) {
    console.error("Error al obtener el evento:", error);
  }

  if (!evento) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p className="font-black uppercase italic">Evento no encontrado</p>
      </div>
    );
  }

  // Validaciones de datos
  const listaPrecios = Array.isArray(evento.evento_precios) ? evento.evento_precios : [];
  const todosLosMedios = (Array.isArray(evento.Media) ? evento.Media : [evento.Media]).filter(Boolean);

  return (
    <div className="bg-background-dark min-h-screen text-white font-display pb-20 overflow-x-hidden">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,700,1,0" />

      <main className="max-w-6xl mx-auto px-6">
        {/* Carrusel de Medios */}
        <section className="h-[45vh] md:h-[65vh] w-full mt-6 mb-12">
          <MediaCarousel media={todosLosMedios} strapiUrl={STRAPI_URL} />
        </section>

        {/* Título del Evento */}
        <header className="flex flex-col items-center text-center mb-16">
          <h1 className="text-4xl md:text-8xl font-black uppercase italic tracking-tighter leading-none mb-10">
            {evento.Nombre}
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-white/10 pt-12">
          {/* Columna Izquierda: Información Detallada */}
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

          {/* Columna Derecha: Formulario de Pago (Cambios Locales Conservados) */}
          <aside className="relative">
            <FormularioInscripcion 
              eventoId={id} 
              nombreEvento={evento.Nombre} 
              opcionesPrecios={listaPrecios} 
            />
          </aside>
        </div>
      </main>
    </div>
  );
}