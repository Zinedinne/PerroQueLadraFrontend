import { fetchStrapi } from "../../lib/strapi";
import { formatManualPrice } from "../../format";
import Link from "next/link";
import Navbar from "../../components/navbar"; // IMPORTANTE: Tu componente existente

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>; 
}) {
  const { categoria } = await searchParams;
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

  // 1. Datos de categorías y productos
  const tiposRes = await fetchStrapi("tipo-productos?sort=Tipo:asc");
  const categorias = tiposRes?.data || [];

  const filterQuery = categoria 
    ? `productos?populate=*&filters[tipo_producto][Tipo][$eq]=${categoria}` 
    : "productos?populate=*";

  const response = await fetchStrapi(filterQuery);
  const productos = response?.data || [];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark font-display text-white">
      
      {/* 1. TU NAVBAR REAL */}
      <Navbar />

      <main className="flex-grow flex flex-col items-center">
        <div className="layout-content-container flex flex-col w-full max-w-6xl px-4 md:px-10 py-10">
          
          {/* BREADCRUMBS CORREGIDOS */}
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-white/40">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-white/10">/</span>
            <Link href="/productos/catalog" className={`transition-colors ${!categoria ? 'text-primary' : 'hover:text-primary'}`}>Tienda</Link>
            {categoria && (
              <>
                <span className="text-white/10">/</span>
                <span className="text-primary italic">{categoria}</span>
              </>
            )}
          </nav>

          {/* HERO SECCIÓN */}
          <section className="w-full mb-16">
            <div 
              className="flex min-h-[350px] flex-col gap-4 bg-cover bg-center rounded-3xl items-center justify-center p-6 text-center border border-white/5 relative overflow-hidden shadow-2xl"
              style={{ 
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2000')` 
              }}
            >
              <h1 className="text-white text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
                {categoria ? categoria : "Store"}
              </h1>
              <p className="text-primary text-[10px] md:text-xs font-black uppercase tracking-[0.5em] mt-2">
                {categoria ? `Selección exclusiva / ${categoria}` : "Equipamiento de alto rendimiento"}
              </p>
            </div>
          </section>

          <div className="flex flex-col md:flex-row gap-16">
            
            {/* SIDEBAR FILTROS */}
            <aside className="w-full md:w-64 shrink-0">
              <div className="sticky top-32">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                   <h3 className="text-white text-xs font-black uppercase tracking-[0.2em]">Filtros</h3>
                   {categoria && (
                     <Link href="/productos/catalog" className="text-[9px] text-primary hover:bg-primary hover:text-black border border-primary/20 px-2 py-1 rounded transition-all font-bold uppercase">
                       Reset
                     </Link>
                   )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-4">
                    <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-2">Categorías</p>
                    {categorias.map((cat: any) => (
                      <Link 
                        key={cat.id}
                        href={`/productos/catalog?categoria=${cat.Tipo}`}
                        className={`flex items-center gap-4 group transition-all ${categoria === cat.Tipo ? 'text-primary' : 'text-white/40'}`}
                      >
                        <div className={`h-px transition-all duration-300 ${categoria === cat.Tipo ? 'w-6 bg-primary' : 'w-0 bg-white group-hover:w-4 group-hover:bg-white'}`} />
                        <span className="text-[11px] font-black uppercase tracking-widest group-hover:text-white">
                          {cat.Tipo}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* GRID DE PRODUCTOS */}
            <div className="flex-1">
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-10">
                <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em]">
                  Mostrando {productos.length} piezas únicas
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 md:gap-x-10">
                {productos.map((item: any) => {
                  const idParaUrl = item.documentId || item.id;
                  const media = item.Imagen || item.imagen;
                  const foto = Array.isArray(media) ? media[0] : media;
                  const imgUrl = foto?.url 
                    ? (foto.url.startsWith('http') ? foto.url : `${STRAPI_URL}${foto.url}`) 
                    : "/placeholder-product.jpg";

                  return (
                    <Link key={item.id} href={`/productos/${idParaUrl}`} className="group flex flex-col gap-4">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 border border-white/5 shadow-xl">
                        <img 
                          src={imgUrl} 
                          alt={item.Nombre} 
                          className="w-full h-full object-cover transition-all duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105 opacity-60 group-hover:opacity-100" 
                        />
                        {/* Overlay dinámico */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-white font-black text-sm uppercase italic leading-tight group-hover:text-primary transition-colors tracking-tight">
                          {item.Nombre}
                        </h4>
                        <p className="text-primary font-black text-xl italic">{formatManualPrice(item.Precio)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-white/5 py-12 flex flex-col items-center">
        <p className="text-[10px] font-black text-white/10 uppercase tracking-[1em]">PERRO QUE LADRA © 2026</p>
      </footer>
    </div>
  );
}