import { fetchStrapi } from "./lib/strapi";
import { formatManualDate, formatManualPrice } from "./format";
import Link from "next/link";
import Navbar from "./components/navbar";

export default async function HomePage() {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

  const [inicioData, productosData, eventosData] = await Promise.all([
    fetchStrapi("homepage?populate=*"),
    fetchStrapi("productos?populate=*"),
    fetchStrapi("eventos?populate=*&sort=FechaInicio:asc") 
  ]);

  const inicio = Array.isArray(inicioData?.data) ? inicioData.data[0] : inicioData?.data;
  const productos = productosData?.data || [];
  const eventos = eventosData?.data || [];
  const proximoEvento = eventos.length > 0 ? eventos[0] : null;

  const rawMedia = proximoEvento?.Media || proximoEvento?.Imagen || inicio?.Media_Hero || inicio?.Imagen_Hero;
  const primerMedia = Array.isArray(rawMedia) ? rawMedia[0] : rawMedia;
  const mediaUrl = primerMedia?.url 
    ? (primerMedia.url.startsWith('http') ? primerMedia.url : `${STRAPI_URL}${primerMedia.url}`) 
    : null;

  const isVideo = primerMedia?.mime?.includes("video");

  if (!inicio) return null;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-dark font-display text-white">
      <Navbar />

      <div className="flex flex-1 justify-center">
        <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1 px-4 md:px-10">
          
          <main className="flex flex-col gap-12 md:gap-20 mt-8">
            
            {/* --- SECCIÓN HERO (VIDEO ARRIBA, TEXTO ABAJO) --- */}
            <section className="flex flex-col gap-8 md:gap-12">
              
              {/* VIDEO / IMAGEN PRINCIPAL */}
              <div className="relative flex h-[50vh] md:h-[75vh] w-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-zinc-900">
                {mediaUrl ? (
                  isVideo ? (
                    <video
                      src={mediaUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img src={mediaUrl} alt="Hero Background" className="h-full w-full object-cover" />
                  )
                ) : <div className="h-full w-full bg-zinc-900" />}
              </div>

              {/* BLOQUE DE TEXTO DEBAJO DEL VIDEO */}
              <div className="flex flex-col items-center text-center gap-6">
                <div className="space-y-4">
                  <p className="text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.6em]">
                    {proximoEvento ? "Próxima Fecha Confirmada" : "Perro que ladra"}
                  </p>
                  <h1 
                    className="text-white text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none"
                    style={{
                      WebkitTextStroke: '1px rgba(255,255,255,0.1)',
                      paintOrder: 'stroke fill'
                    }}
                  >
                    {proximoEvento ? proximoEvento.Nombre : inicio.Titulo_Hero}
                  </h1>
                </div>

                {proximoEvento && (
                  <p className="text-white/60 text-sm md:text-xl font-bold uppercase tracking-widest italic">
                    {proximoEvento.Lugar} — {formatManualDate(proximoEvento.FechaInicio)}
                  </p>
                )}

                <div className="mt-2">
                  <Link 
                    href={proximoEvento ? `/eventos/${proximoEvento.documentId || proximoEvento.id}` : "/eventos"} 
                    className="inline-block bg-primary text-black font-black py-5 px-14 rounded-full hover:bg-white hover:scale-105 transition-all uppercase tracking-[0.3em] text-[10px]"
                  >
                    Más información
                  </Link>
                </div>
              </div>
            </section>

            {/* --- PRODUCTOS --- */}
            <section>
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-white text-2xl font-black uppercase italic tracking-widest leading-none">Lo más buscado</h2>
                <div className="h-px flex-1 bg-white/10 ml-6 hidden md:block"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {productos.slice(0, 4).map((item: any) => {
                  const mediaField = item.Imagen || item.imagen;
                  const fotoPrincipal = Array.isArray(mediaField) ? mediaField[0] : mediaField;
                  const imgUrl = fotoPrincipal?.url 
                    ? (fotoPrincipal.url.startsWith('http') ? fotoPrincipal.url : `${STRAPI_URL}${fotoPrincipal.url}`) 
                    : "/placeholder.jpg";

                  return (
                    <Link key={item.id} href={`/productos/${item.documentId || item.id}`} className="group flex flex-col gap-4">
                      <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 relative">
                        <img 
                          src={imgUrl} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 opacity-70 group-hover:opacity-100" 
                          alt={item.Nombre}
                        />
                      </div>
                      <div className="px-1">
                        <h3 className="text-white font-black uppercase text-[11px] italic group-hover:text-primary transition-colors tracking-tighter">
                          {item.Nombre}
                        </h3>
                        <p className="text-primary font-black text-xl italic mt-1">{formatManualPrice(item.Precio)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* --- SECCIÓN DE EVENTOS ADICIONALES (RECUPERADA) --- */}
            <section className="py-10">
              <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <h2 className="text-white text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                  Eventos <span className="text-primary">2026</span>
                </h2>
                <Link href="/eventos" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-colors pb-2 border-b border-white/10">
                  Ver agenda completa +
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {eventos.slice(1, 3).map((evento: any) => (
                  <Link 
                    key={evento.id} 
                    href={`/eventos/${evento.documentId || evento.id}`}
                    className="group relative flex flex-col justify-end min-h-[400px] rounded-3xl p-8 overflow-hidden border border-white/5 bg-zinc-900"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                    {(() => {
                        const evtMedia = Array.isArray(evento.Imagen || evento.Media) ? (evento.Imagen || evento.Media)[0] : (evento.Imagen || evento.Media);
                        const url = evtMedia?.url ? (evtMedia.url.startsWith('http') ? evtMedia.url : `${STRAPI_URL}${evtMedia.url}`) : "";
                        return (
                           <img 
                            src={url} 
                            className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" 
                            alt={evento.Nombre} 
                           />
                        )
                    })()}
                    <div className="relative z-20">
                      <span className="text-primary text-[10px] font-black uppercase tracking-widest mb-2 block">
                        {formatManualDate(evento.FechaInicio || evento.Fecha)}
                      </span>
                      <h3 className="text-3xl font-black text-white uppercase italic leading-none group-hover:text-primary transition-colors">
                        {evento.Nombre}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

          </main>

          <footer className="mt-20 border-t border-white/5 py-12 flex flex-col items-center">
             <p className="text-[10px] font-black text-white/10 uppercase tracking-[1em]">PERRO QUE LADRA © 2026</p>
          </footer>

        </div>
      </div>
    </div>
  );
}