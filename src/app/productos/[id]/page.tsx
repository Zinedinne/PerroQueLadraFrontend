import { fetchStrapi } from "./../../lib/strapi";
import { formatManualPrice } from "../../format";
import ProductActions from "./ProductActions";
import ProductGallery from "./ProductGallery";
import Link from "next/link";

export default async function ProductoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

  // CONSULTAS PARALELAS
  const [datosRes, imagenesRes] = await Promise.all([
    fetchStrapi(`productos/${id}?fields[0]=Nombre&fields[1]=Precio&fields[2]=Descripcion&fields[3]=Marca&populate[tipo_producto]=*&populate[variantes][populate][tallas]=*`),
    fetchStrapi(`productos/${id}?populate=Imagen`) 
  ]);

  const producto = datosRes?.data;
  const imagenesData = imagenesRes?.data?.Imagen;

  if (!producto) return <div className="min-h-screen bg-background-dark text-white flex items-center justify-center font-display uppercase">Producto no encontrado</div>;

  const imagenes = Array.isArray(imagenesData) ? imagenesData : (imagenesData ? [imagenesData] : []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-dark font-display text-white">
      

      {/* 2. NAVEGACIÓN DE RUTA (BREADCRUMBS) */}
      <nav className="flex px-6 md:px-20 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
        <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
        <span className="mx-2">/</span>
        
        {/* Enlace al catálogo usando tu ruta real */}
        <Link 
          href="/productos/catalog"
          className="hover:text-primary transition-colors cursor-pointer"
        >
          Catálogo
        </Link>

        <span className="mx-2 text-primary">/</span>
        <span className="text-white">{producto.Nombre}</span>
      </nav>

      {/* 3. CONTENIDO PRINCIPAL */}
      <main className="flex-1 px-6 md:px-20 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 max-w-7xl mx-auto">
          
          <ProductGallery 
            imagenes={imagenes} 
            nombre={producto.Nombre} 
            STRAPI_URL={STRAPI_URL} 
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">
                {producto.Marca || 'PERRO QUE LADRA'}
              </span>
              <span className="bg-white/5 px-3 py-1 rounded text-[9px] font-bold text-white/40 uppercase tracking-widest">
                {producto.tipo_producto?.Tipo}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black uppercase italic leading-[0.9] mb-6 tracking-tighter">
              {producto.Nombre}
            </h1>

            <p className="text-primary font-black text-4xl mb-8 flex items-center gap-3">
              {formatManualPrice(producto.Precio)}
            </p>

            <div className="mb-10">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4 border-b border-white/5 pb-2 inline-block">Descripción</h3>
              <p className="text-white/60 text-sm leading-relaxed whitespace-pre-line border-l-2 border-primary pl-6 py-2 bg-white/5 rounded-r-lg italic">
                {producto.Descripcion || "Detalle de producto exclusivo de nuestra colección."}
              </p>
            </div>

            <ProductActions 
              producto={producto} 
              variantes={producto.variantes || []} 
            />

            {/* INFO EXTRA STYLE */}
            <div className="mt-12 flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-zinc-900/50">
               <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z" opacity="0.2"></path><path d="M128,72a8,8,0,0,1,8,8v40h40a8,8,0,0,1,0,16H128a8,8,0,0,1-8-8V80A8,8,0,0,1,128,72Z"></path></svg>
               </div>
               <div>
                 <h4 className="text-[10px] font-black uppercase text-white">Envío a todo el país</h4>
                 <p className="text-[9px] text-white/40 uppercase tracking-widest italic">Gestionado por el equipo Supratec.</p>
               </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 px-6 md:px-20 py-10 bg-zinc-950/50">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black text-white/10 uppercase tracking-[1em]">PERRO QUE LADRA © 2026</p>
        </div>
      </footer>
    </div>
  );
}