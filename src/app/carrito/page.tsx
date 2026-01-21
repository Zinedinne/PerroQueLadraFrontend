"use client";
import { useEffect, useState, useCallback } from "react";
import { formatManualPrice } from "../format"; 
import Link from "next/link";

export default function CarritoPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userStorage = localStorage.getItem("user");

    if (!token || !userStorage) {
      setLoading(false);
      return;
    }

    const user = JSON.parse(userStorage);
    const userId = user.id || user.user?.id;

    try {
      // Importante: cache: 'no-store' para evitar que Next.js te muestre datos viejos
      const query = new URLSearchParams({
        "filters[cliente][id][$eq]": userId.toString(),
        "populate[producto][populate]": "Imagen",
        "pagination[limit]": "100",
      });

      const res = await fetch(`${STRAPI_URL}/api/carritos?${query.toString()}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        cache: 'no-store' 
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error("Error al obtener datos");

      setItems(responseData.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [STRAPI_URL]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // --- FUNCIÓN DE ELIMINACIÓN DEFINITIVA ---
  const handleDelete = async (item: any) => {
    const token = localStorage.getItem("token");
    
    // En Strapi 5, el ID para borrar es el documentId del registro del carrito
    const idABorrar = item.documentId || item.id;

    console.log("Intentando borrar registro de carrito con ID:", idABorrar);

    try {
      const res = await fetch(`${STRAPI_URL}/api/carritos/${idABorrar}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        console.log("✅ Borrado confirmado por Strapi");
        // Filtramos el estado local para que desaparezca de la vista
        setItems((prev) => prev.filter((i: any) => (i.documentId || i.id) !== idABorrar));
      } else {
        const errorData = await res.json();
        console.error("❌ Strapi rechazó el borrado:", errorData);
        alert("Error: No tienes permisos para borrar este item o el ID es incorrecto.");
      }
    } catch (err) {
      console.error("❌ Error de red:", err);
    }
  };

  const total = items.reduce((acc, item: any) => {
    const data = item.attributes || item;
    const producto = data.producto?.data?.attributes || data.producto;
    return acc + ((producto?.Precio || 0) * (data.Cantidad || 0));
  }, 0);

  if (loading) return (
    <div className="min-h-screen bg-background-dark text-primary flex items-center justify-center font-black italic uppercase animate-pulse">
      Sincronizando Jauría...
    </div>
  );

  return (
    <main className="min-h-screen bg-background-dark text-white p-6 md:p-20 font-display">
      <div className="max-w-6xl mx-auto">
        
        {/* BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-white/40">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-white/10">/</span>
          <Link href="/productos/catalog" className="hover:text-primary transition-colors">Tienda</Link>
          <span className="text-white/10">/</span>
          <span className="text-primary italic">Carrito</span>
        </nav>

        <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter mb-12">
          TU_<span className="text-primary">CARRITO</span>
        </h1>

        {items.length === 0 ? (
          <div className="border-t border-white/10 py-20 text-center">
            <p className="text-white/40 uppercase tracking-[0.3em] mb-8">El carrito está vacío.</p>
            <Link href="/productos/catalog" className="bg-white text-black px-8 py-4 font-black uppercase italic hover:bg-primary transition-all">
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-8">
              {items.map((item: any) => {
                const data = item.attributes || item;
                const productoObj = data.producto?.data || data.producto;
                const productoAttr = productoObj?.attributes || productoObj;
                
                // ID del PRODUCTO para navegar al detalle
                const idProducto = productoObj?.documentId || productoObj?.id;

                if (!productoAttr) return null;

                // Extracción de imagen robusta
                const imagenData = productoAttr.Imagen?.data || productoAttr.Imagen;
                const fotoArray = Array.isArray(imagenData) ? imagenData[0] : imagenData;
                const fotoAttr = fotoArray?.attributes || fotoArray;
                
                const imgUrl = fotoAttr?.url 
                  ? (fotoAttr.url.startsWith('http') ? fotoAttr.url : `${STRAPI_URL}${fotoAttr.url}`) 
                  : "/placeholder-product.jpg";

                return (
                  <div key={item.id} className="flex gap-6 border-b border-white/5 pb-8 group animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    <Link href={`/productos/${idProducto}`} className="w-24 h-32 md:w-40 md:h-52 bg-zinc-900 overflow-hidden rounded-xl border border-white/5 shrink-0 block">
                      <img 
                        src={imgUrl} 
                        alt={productoAttr.Nombre} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-100" 
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-product.jpg"; }}
                      />
                    </Link>
                    
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex justify-between items-start">
                          <Link href={`/productos/${idProducto}`} className="hover:text-primary transition-colors">
                            <h3 className="text-xl md:text-3xl font-black uppercase italic leading-none">{productoAttr.Nombre}</h3>
                          </Link>
                          {/* BOTÓN DE ELIMINAR PASANDO EL ITEM COMPLETO */}
                          <button 
                            onClick={() => handleDelete(item)} 
                            className="text-white/20 hover:text-red-500 transition-colors p-2 text-xl"
                          >
                            ✕
                          </button>
                        </div>
                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] mt-3 mb-2">{data.Detalle || "Edición Jauría"}</p>
                        <p className="text-primary font-black text-xl italic">{formatManualPrice(productoAttr.Precio)}</p>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">
                          Cantidad: <span className="text-white">{data.Cantidad}</span>
                        </span>
                        <span className="text-sm font-black text-white/60 italic">
                          Subtotal: {formatManualPrice(productoAttr.Precio * data.Cantidad)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-10 rounded-3xl sticky top-32">
                <h2 className="text-xs font-black uppercase tracking-[0.5em] text-white/40 mb-10 border-b border-white/5 pb-4">Checkout</h2>
                <div className="flex justify-between items-end mb-10">
                  <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Total Final</span>
                  <span className="text-5xl font-black text-primary italic leading-none">{formatManualPrice(total)}</span>
                </div>
                <button className="w-full bg-primary hover:bg-white text-black font-black uppercase italic py-6 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,0,0.1)]">
                  Finalizar Orden
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}