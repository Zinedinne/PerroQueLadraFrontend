"use client";
import { useEffect, useState, useCallback } from "react";
import { formatManualPrice } from "../format";
import Link from "next/link";

export default function PerfilPage() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

  const fetchPedidos = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userStorage = localStorage.getItem("user");

    if (!token || !userStorage) {
      window.location.href = "/login";
      return;
    }

    const userData = JSON.parse(userStorage);
    setUser(userData);
    // Extraemos el ID del usuario de forma segura
    const userId = userData.id || userData.user?.id;

    try {
      // IMPORTANTE: Agregamos populate=Lista_Productos para que Strapi envíe los items
      const query = new URLSearchParams({
        "filters[users_permissions_user][id][$eq]": userId.toString(),
        "sort[0]": "createdAt:desc",
        "populate": "Lista_Productos", 
      });

      const res = await fetch(`${STRAPI_URL}/api/pedidos?${query.toString()}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      const responseData = await res.json();
      
      if (res.ok) {
        // En Strapi v4/v5 los datos vienen en responseData.data
        setPedidos(responseData.data || []);
      }
    } catch (err) {
      console.error("Error al cargar pedidos:", err);
    } finally {
      setLoading(false);
    }
  }, [STRAPI_URL]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  if (loading) return (
    <div className="min-h-screen bg-background-dark text-primary flex items-center justify-center font-black italic uppercase animate-pulse">
      Sincronizando Jauría...
    </div>
  );

  return (
    <main className="min-h-screen bg-background-dark text-white p-6 md:p-20 font-display">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-16">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-4 leading-none">
            MI_<span className="text-primary">CUENTA</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">
            Bienvenido, {user?.username || "Miembro de la Jauría"}
          </p>
        </header>

        <section className="space-y-12">
          <h2 className="text-xl font-black uppercase italic border-b border-white/10 pb-4">Historial de Pedidos</h2>

          {pedidos.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
              <p className="text-white/30 uppercase text-xs tracking-widest mb-6 font-bold">Aún no has realizado ninguna orden.</p>
              <Link href="/productos/catalog" className="bg-white text-black px-6 py-3 font-black uppercase italic hover:bg-primary transition-all inline-block">
                Ir a la tienda
              </Link>
            </div>
          ) : (
            pedidos.map((pedido: any) => {
              // Extraer datos compatible con Strapi v4 y v5
              const data = pedido.attributes || pedido;
              const fecha = new Date(data.createdAt).toLocaleDateString('es-MX', {
                year: 'numeric', month: 'long', day: 'numeric'
              });

              return (
                <div key={pedido.id} className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.01]">
                  
                  {/* HEADER DEL PEDIDO */}
                  <div className="p-6 md:p-8 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 bg-white/5">
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Orden #{pedido.id}</p>
                      <p className="text-sm font-bold uppercase">{fecha}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Estado</p>
                        <span className={`text-[10px] font-black uppercase italic px-3 py-1 rounded-full border ${
                          data.Estado === 'Pendiente' ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/5' : 
                          data.Estado === 'Pagado' ? 'border-primary/50 text-primary bg-primary/5' :
                          data.Estado === 'Enviado' ? 'border-blue-500/50 text-blue-500 bg-blue-500/5' :
                          'border-white/20 text-white/60'
                        }`}>
                          {data.Estado}
                        </span>
                      </div>
                      <div className="text-right border-l border-white/10 pl-6">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-2xl font-black text-primary italic leading-none">{formatManualPrice(data.total)}</p>
                      </div>
                    </div>
                  </div>

                  {/* DESGLOSE DE PRODUCTOS (COMPONENTE REPETIBLE) */}
                  <div className="p-6 md:p-8 space-y-4">
                    <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-2">Artículos</p>
                    <ul className="space-y-3">
                      {data.Lista_Productos && data.Lista_Productos.length > 0 ? (
                        data.Lista_Productos.map((prod: any, idx: number) => {
                          const item = prod.attributes || prod;
                          return (
                            <li key={idx} className="flex justify-between items-center group">
                              <div className="flex gap-4 items-center">
                                <span className="bg-white/10 text-white px-2 py-1 text-[10px] font-black rounded">
                                  {item.cantidad}
                                </span>
                                <div>
                                  <p className="font-black uppercase italic text-sm text-white/90 tracking-tight">
                                    {item.Producto_Nombre}
                                  </p>
                                  <p className="text-[9px] text-white/30 uppercase font-bold tracking-tighter">
                                    Detalle: {item.Variante || "Original"}
                                  </p>
                                </div>
                              </div>
                              <span className="text-white/60 font-mono text-xs">
                                {formatManualPrice(item.Subtotal)}
                              </span>
                            </li>
                          );
                        })
                      ) : (
                        <p className="text-xs italic text-white/20">No se encontraron detalles de productos.</p>
                      )}
                    </ul>
                  </div>

                  {/* INFO LOGÍSTICA */}
                  <div className="p-6 md:p-8 bg-black/40 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-black uppercase text-[10px] text-white/20 mb-3 tracking-[0.2em]">Dirección de Entrega</h4>
                      <div className="text-[11px] text-white/60 uppercase font-bold leading-relaxed">
                        <p className="text-white font-black mb-1">{data.Nombre_Completo}</p>
                        <p>{data.Calle} #{data.Numero_Casa}</p>
                        <p>CP {data.Codigo_Postal}, {data.Estado_Pais}</p>
                        <p className="mt-2 text-white/30 italic">Ref: {data.Referencias || "Sin referencias"}</p>
                      </div>
                    </div>
                    <div className="md:text-right">
                      <h4 className="font-black uppercase text-[10px] text-white/20 mb-3 tracking-[0.2em]">Método de Pago</h4>
                      <p className="text-[11px] text-primary font-black uppercase italic">{data.Metodo_Pago}</p>
                      <p className="text-[9px] text-white/20 mt-4 uppercase font-bold tracking-widest">
                        Pago procesado vía transferencia directa
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* LOGOUT */}
        <footer className="mt-24 pt-10 border-t border-white/5 flex justify-center">
          <button 
            onClick={() => { localStorage.clear(); window.location.href = "/"; }}
            className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-red-600 transition-all duration-300"
          >
            [ Salir_de_la_cuenta ]
          </button>
        </footer>

      </div>
    </main>
  );
}