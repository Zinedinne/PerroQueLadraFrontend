import { fetchStrapi } from "./lib/strapi";
import { formatManualDate, formatManualPrice } from "./format";
import Link from "next/link";
import Navbar from "./components/navbar";

// Desactiva la caché para traer datos frescos siempre
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "https://perroqueladra.com.mx/api";

  // Llamada a la API
  const [inicioData, productosData, eventosData] = await Promise.all([
    fetchStrapi("homepage?populate=*"),
    fetchStrapi("productos?populate=*"),
    fetchStrapi("eventos?populate=*&sort=FechaInicio:desc")
  ]);

  // Procesamiento de datos con validación
  const inicio = Array.isArray(inicioData?.data) ? inicioData.data[0] : inicioData?.data;
  const productos = productosData?.data || [];
  const eventos = eventosData?.data || [];

  // Hero: evento más reciente
  const proximoEvento = eventos.length > 0 ? eventos[0] : null;

  // Lógica de Media para el Hero
  const rawMedia = proximoEvento?.Media || proximoEvento?.Imagen || inicio?.Media_Hero || inicio?.Imagen_Hero;
  const primerMedia = Array.isArray(rawMedia) ? rawMedia[0] : rawMedia;
  const mediaUrl = primerMedia?.url
    ? (primerMedia.url.startsWith('http') ? primerMedia.url : `${STRAPI_URL}${primerMedia.url}`)
    : null;

  const isVideo = primerMedia?.mime?.includes("video");

  // Extracción del campo Mensaje_Hero
  const mensajeHero = inicio?.Mensaje_Hero || inicio?.attributes?.Mensaje_Hero;

  if (!inicio) return null;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-dark font-sans text-white antialiased">

      <div className="flex flex-1 justify-center">
        <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1 px-4 md:px-10">

          <main className="flex flex-col gap-12 md:gap-16 mt-8">

            {/* --- 1. SECCIÓN HERO --- */}
            <section className="flex flex-col gap-8 md:gap-10">
              <div className="relative flex h-[50vh] md:h-[70vh] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
                {mediaUrl ? (
                  isVideo ? (
                    <video src={mediaUrl} autoPlay muted loop playsInline className="h-full w-full object-cover" />
                  ) : (
                    <img src={mediaUrl} alt="Hero Background" className="h-full w-full object-cover" />
                  )
                ) : <div className="h-full w-full bg-zinc-900" />}

<<<<<<< HEAD
    {proximoEvento && (
      <p className="text-white/60 text-sm md:text-xl font-bold uppercase tracking-widest italic">
        {proximoEvento.Lugar} — {formatManualDate(proximoEvento.FechaInicio)}
      </p>
    )}
  </div>
</section>
            {/* --- SECCIÓN PRODUCTOS (COMENTADA PARA DESPLIEGUE PARCIAL) --- */}
            { <section>
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-white text-2xl font-black uppercase italic tracking-widest leading-none">Lo más buscado</h2>
                <div className="h-px flex-1 bg-white/10 ml-6 hidden md:block"></div>
=======
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                  <Link
                    href={proximoEvento ? `/eventos/${proximoEvento.documentId || proximoEvento.id}` : "/eventos"}
                    className="inline-block bg-primary text-black font-semibold py-2.5 px-6 rounded-full hover:bg-white hover:scale-105 transition-all text-xs md:text-sm shadow-xl"
                  >
                    Más información
                  </Link>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
>>>>>>> 0616f1925c9f2bcaa55420195b9d60f1ecd92e22
              </div>

              <div className="flex flex-col items-center text-center gap-4">
                <div className="space-y-3">
                  <p className="text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.6em]">
                    {proximoEvento ? "Próxima Fecha Confirmada" : "Perro que ladra"}
                  </p>
                  {/* NOMBRE DEL EVENTO EN BLANCO */}
                  <h1 className="text-white text-4xl md:text-7xl font-bold tracking-tight leading-tight">
                    {proximoEvento ? proximoEvento.Nombre : inicio.Titulo_Hero}
                  </h1>
                </div>

                {proximoEvento && (
                  <p className="text-white/70 text-sm md:text-lg font-medium">
                    {proximoEvento.Lugar} — {formatManualDate(proximoEvento.FechaInicio)}
                  </p>
                )}
              </div>
<<<<<<< HEAD
            </section> 
            }
=======
            </section>

            {/* --- 2. SECCIÓN TIENDA (COMENTADA) --- */}
            {/*
            <section className="py-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <h2 className="text-white text-2xl md:text-3xl font-bold tracking-tight">
                  Tienda oficial
                </h2>
                <Link
                  href="/productos/catalog"
                  className="text-xs font-semibold text-white/50 hover:text-primary transition-colors pb-1 border-b border-white/10"
                >
                  Ver todo el catálogo →
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {productos.length > 0 ? (
                  productos.slice(0, 4).map((producto: any) => {
                    const prodMedia = Array.isArray(producto.Imagenes || producto.Imagen)
                      ? (producto.Imagenes || producto.Imagen)[0]
                      : (producto.Imagenes || producto.Imagen);
                    const prodUrl = prodMedia?.url
                      ? (prodMedia.url.startsWith('http') ? prodMedia.url : `${STRAPI_URL}${prodMedia.url}`)
                      : "";

                    return (
                      <Link
                        key={producto.id}
                        href={`/productos/${producto.documentId || producto.id}`}
                        className="group flex flex-col gap-3 bg-zinc-900/40 p-4 rounded-2xl border border-white/5 hover:border-primary/50 transition-all duration-300"
                      >
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-800">
                          {prodUrl && (
                            <img
                              src={prodUrl}
                              alt={producto.Nombre || "Producto"}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">
                            {producto.Nombre}
                          </h3>
                          <p className="text-xs font-medium text-primary mt-1">
                            {formatManualPrice ? formatManualPrice(producto.Precio) : `$${producto.Precio}`}
                          </p>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-white/40 font-medium text-sm col-span-full text-center py-12 border border-white/5 rounded-3xl">
                    Sin productos en vitrina por ahora...
                  </p>
                )}
              </div>
            </section>
            */}
>>>>>>> 0616f1925c9f2bcaa55420195b9d60f1ecd92e22

            {/* --- 3. MENSAJE HERO (ARRIBA DE EVENTOS) --- */}
            {mensajeHero && (
              <section className="py-12 md:py-16 border-y border-white/10 my-4 flex flex-col items-center justify-center text-center">
                {/* ESTILO DEL NOMBRE DEL EVENTO PERO EN ROJO */}
                <h2 className="text-red-500 text-4xl md:text-7xl font-bold tracking-tight leading-tight mb-6 max-w-4xl px-4">
                  Diseñado por corredores para corredores
                </h2>
                <p className="max-w-2xl text-xl md:text-3xl font-medium text-white/90 leading-relaxed px-4">
                  “{mensajeHero}”
                </p>
              </section>
            )}

            {/* --- 4. SECCIÓN EVENTOS --- */}
            <section className="py-6">
              <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <h2 className="text-white text-2xl md:text-4xl font-bold tracking-tight">
                  Próximos eventos
                </h2>
                <Link
                  href="/eventos"
                  className="text-xs font-semibold text-white/50 hover:text-primary transition-colors pb-1 border-b border-white/10"
                >
                  Ver agenda completa →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {eventos.length > 1 ? (
                  eventos.slice(1, 3).map((evento: any) => {
                    const evtMedia = Array.isArray(evento.Imagen || evento.Media)
                      ? (evento.Imagen || evento.Media)[0]
                      : (evento.Imagen || evento.Media);
                    const url = evtMedia?.url
                      ? (evtMedia.url.startsWith('http') ? evtMedia.url : `${STRAPI_URL}${evtMedia.url}`)
                      : "";

                    return (
                      <Link
                        key={evento.id}
                        href={`/eventos/${evento.documentId || evento.id}`}
                        className="group relative flex flex-col justify-end min-h-[360px] rounded-3xl p-8 overflow-hidden border border-white/10 bg-zinc-900"
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                        {url && (
                          <img
                            src={url}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                            alt={evento.Nombre}
                          />
                        )}
                        <div className="relative z-20 space-y-1">
                          <span className="text-primary text-xs font-semibold block">
                            {formatManualDate(evento.FechaInicio || evento.Fecha)}
                          </span>
                          {/* NOMBRE DEL EVENTO EN BLANCO */}
                          <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
                            {evento.Nombre}
                          </h3>
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-white/40 font-medium text-sm col-span-2 text-center py-16 border border-white/10 rounded-3xl">
                    No hay más eventos programados por ahora...
                  </p>
                )}
              </div>
            </section>

          </main>

          {/* --- FOOTER --- */}
          <footer className="mt-20 border-t border-white/10 py-10 flex flex-col items-center">
            <p className="text-xs font-medium text-white/40">
              Perro Que Ladra © 2026. Todos los derechos reservados.
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
}
