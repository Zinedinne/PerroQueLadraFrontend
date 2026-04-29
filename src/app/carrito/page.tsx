"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { formatManualPrice } from "../format"; 
import Link from "next/link";
import { toast, Toaster } from "sonner";
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// Inicializamos Mercado Pago
initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || "TU_PUBLIC_KEY_AQUI");

export default function CarritoPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [shippingData, setShippingData] = useState({
    Nombre_Completo: "", 
    Telefono: "", 
    Calle: "", 
    Numero_Casa: "", 
    Estado_Pais: "", 
    Codigo_Postal: "", 
    Referencias: ""
  });

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

  // --- 1. OBTENER CARRITO CON IMÁGENES ---
  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userStorage = localStorage.getItem("user");
    
    if (!token || !userStorage) { 
      setLoading(false); 
      return; 
    }
    
    try {
      const user = JSON.parse(userStorage);
      const userId = user.id || user.user?.id;
      
      const query = new URLSearchParams({
        "filters[cliente][id][$eq]": userId.toString(),
        "populate[producto][populate]": "Imagen", // Traemos la relación de imagen
        "pagination[limit]": "100",
      });

      const res = await fetch(`${STRAPI_URL}/api/carritos?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const responseData = await res.json();
      setItems(responseData.data || []);
    } catch (err) { 
      console.error("Error cargando carrito:", err); 
    } finally { 
      setLoading(false); 
    }
  }, [STRAPI_URL]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  // --- 2. ELIMINAR PRODUCTO DEL CARRITO ---
const removeItem = async (idABorrar: string | number) => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    // 1. Petición real a Strapi
    const res = await fetch(`${STRAPI_URL}/api/carritos/${idABorrar}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      // 2. ACTUALIZACIÓN REAL DE LA UI
      // Usamos el callback (prev) para asegurarnos de tener la lista más reciente
      setItems((prevItems) => 
        prevItems.filter((item: any) => {
          // Strapi a veces pone el ID en item.id o item.documentId
          const currentId = item.documentId || item.id;
          return currentId !== idABorrar;
        })
      );

      toast.success("Eliminado correctamente");

      // 3. Si ya no quedan items, quitamos el botón de pago
      if (items.length <= 1) setPreferenceId(null);
    } else {
      throw new Error("Error en la respuesta de Strapi");
    }
  } catch (error) {
    console.error("Error al borrar:", error);
    toast.error("No se pudo quitar de la lista");
  }
};

  // --- 3. CALCULAR TOTAL ---
  const total = useMemo(() => {
    return items.reduce((acc, item: any) => {
      const data = item.attributes || item;
      const producto = data.producto?.data?.attributes || data.producto;
      const precioUnitario = producto?.Precio || (data.Total / data.Cantidad) || 0;
      return acc + (precioUnitario * (data.Cantidad || 0));
    }, 0);
  }, [items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
    if (preferenceId) setPreferenceId(null);
  };

  // --- 4. CONFIRMAR PEDIDO Y GENERAR PAGO ---
  const handleConfirmarPedido = async () => {
    const { Nombre_Completo, Telefono, Calle, Codigo_Postal } = shippingData;
    
    if (!Nombre_Completo || !Telefono || !Calle || !Codigo_Postal) {
      toast.error("Faltan datos de envío obligatorios.");
      return;
    }

    setIsProcessing(true);
    const token = localStorage.getItem("token");
    const userStorage = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userStorage.id || userStorage.user?.id;
    const userEmail = userStorage.email || userStorage.user?.email || "cliente@test.com";

    try {
      const listaProductosJSON = items.map((item: any) => {
        const data = item.attributes || item;
        const p = data.producto?.data?.attributes || data.producto;
        return {
          Producto_Nombre: p?.Nombre || data.Detalle || "Inscripción",
          cantidad: data.Cantidad || 0,
          Precio_Unitario: p?.Precio || (data.Total / data.Cantidad) || 0,
          Subtotal: (p?.Precio || (data.Total / data.Cantidad) || 0) * (data.Cantidad || 0),
          Variante: data.Detalle || "N/A" 
        };
      });

      const resPedido = await fetch(`${STRAPI_URL}/api/pedidos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ data: { 
          Estado: "Pendiente", 
          users_permissions_user: userId, 
          total, 
          Metodo_Pago: "Mercado Pago",
          ...shippingData,
          Lista_Productos: listaProductosJSON 
        }})
      });

      const pedidoCreado = await resPedido.json();
      const pedidoId = pedidoCreado.data.documentId;

      const resMP = await fetch("/api/checkout/create_preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, pedidoId, userEmail }),
      });
      const dataMP = await resMP.json();

      await fetch(`${STRAPI_URL}/api/pedidos/${pedidoId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ data: { MP_Payment_ID: String(dataMP.preferenceId) } })
      });

      setPreferenceId(dataMP.preferenceId);
       console.log("✅ Pedido confirmado y preferencia creada:", dataMP.preferenceId);
      toast.success("Datos confirmados. Procede al pago.");
    } catch (error) {
      toast.error("Error al procesar el pedido");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-primary flex items-center justify-center font-black italic text-4xl animate-pulse">
      CARGANDO_JAURÍA...
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-20 font-sans">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
      <Toaster richColors position="top-center" />
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mb-12">
          TU_<span className="text-primary">CARRITO</span>
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24 border-t border-white/10">
            <p className="text-white/40 font-mono mb-8">Tu carrito está vacío.</p>
            <Link href="/productos/catalog" className="bg-white text-black px-12 py-4 font-black uppercase italic hover:bg-primary transition-all">
              Ir al Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            
            <div className="lg:col-span-2 space-y-12">
              {/* --- 01. ENVÍO --- */}
              <div className="bg-zinc-900/30 p-8 rounded-[2rem] border border-white/5 space-y-8">
                <h2 className="text-3xl font-black uppercase italic text-primary flex items-center gap-3">
                  <span className="text-white/20">01.</span> Envío_
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-black">
                  <input name="Nombre_Completo" value={shippingData.Nombre_Completo} onChange={handleInputChange} placeholder="NOMBRE COMPLETO" className="md:col-span-2 bg-white p-5 rounded-xl outline-none focus:ring-4 focus:ring-primary/50" />
                  <input name="Telefono" value={shippingData.Telefono} onChange={handleInputChange} placeholder="TELÉFONO" className="bg-white p-5 rounded-xl outline-none" />
                  <input name="Codigo_Postal" value={shippingData.Codigo_Postal} onChange={handleInputChange} placeholder="C.P." className="bg-white p-5 rounded-xl outline-none" />
                  <input name="Calle" value={shippingData.Calle} onChange={handleInputChange} placeholder="CALLE" className="bg-white p-5 rounded-xl outline-none" />
                  <input name="Numero_Casa" value={shippingData.Numero_Casa} onChange={handleInputChange} placeholder="NÚMERO" className="bg-white p-5 rounded-xl outline-none" />
                  <input name="Estado_Pais" value={shippingData.Estado_Pais} onChange={handleInputChange} placeholder="ESTADO / PAÍS" className="md:col-span-2 bg-white p-5 rounded-xl outline-none" />
                </div>
              </div>

              {/* --- 02. RESUMEN CON LINKS Y DELETE --- */}
              <div className="space-y-6 pt-10 border-t border-white/10">
                <h2 className="text-2xl font-black uppercase italic text-white/40 flex items-center gap-3">
                  <span className="text-primary">02.</span> Resumen_
                </h2>
                <div className="space-y-4">
                  {items.map((item: any) => {
                    const data = item.attributes || item;
                    const producto = data.producto?.data?.attributes || data.producto;
                    const docId = data.producto?.data?.documentId; // ID para el Link
                    
                    const imgUrl = producto?.Imagen?.data?.attributes?.url || producto?.Imagen?.url;
                    const finalImg = imgUrl ? `${STRAPI_URL}${imgUrl}` : null;
                    const title = producto?.Nombre || data.Detalle || "Producto";
                    const unitPrice = producto?.Precio || (data.Total / data.Cantidad) || 0;
                      
                    return (
                      <div key={item.id || item.documentId} className="group relative flex justify-between items-center bg-zinc-900/50 p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all">
                        
                        {/* Botón Eliminar */}
                        <button 
                          onClick={() => removeItem(item.documentId || item.id)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-10"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>

                        <div className="flex gap-4 items-center flex-1">
                          {/* Imagen con Link */}
                          <Link href={docId ? `/productos/${docId}` : "#"} className="w-20 h-20 bg-black rounded-xl flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                            {finalImg ? (
                              <img src={finalImg} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="Foto" />
                            ) : (
                              <span className="material-symbols-outlined text-primary text-4xl">
                                {producto?.Nombre ? "shopping_bag" : "local_activity"}
                              </span>
                            )}
                          </Link>

                          <div>
                            {/* Título con Link */}
                            {docId ? (
                              <Link href={`/productos/${docId}`}>
                                <h3 className="font-black uppercase italic text-lg text-white hover:text-primary transition-colors leading-tight">{title}</h3>
                              </Link>
                            ) : (
                              <h3 className="font-black uppercase italic text-lg text-white leading-tight">{title}</h3>
                            )}
                            <p className="text-white/40 font-mono text-[10px] tracking-widest mt-1 uppercase">
                              CANTIDAD: {data.Cantidad} • {formatManualPrice(unitPrice)} C/U
                            </p>
                          </div>
                        </div>

                        <p className="text-white font-black text-xl font-mono shrink-0 ml-4">
                          {formatManualPrice(unitPrice * data.Cantidad)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* --- COLUMNA DERECHA: TOTAL --- */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 sticky top-10 shadow-2xl">
                <div className="flex flex-col gap-2 mb-10 border-b border-white/10 pb-8">
                  <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Total a Pagar</span>
                  <span className="text-5xl md:text-6xl font-black text-primary italic leading-none truncate">
                    {formatManualPrice(total)}
                  </span>
                </div>

                {!preferenceId ? (
                  <button onClick={handleConfirmarPedido} disabled={isProcessing} className="w-full bg-primary text-black font-black py-6 rounded-2xl uppercase italic text-xl hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                    {isProcessing ? "Procesando..." : "Confirmar Pedido_"}
                  </button>
                ) : (
                  <div className="animate-in fade-in zoom-in duration-500 space-y-4">
                    <div className="bg-black/50 p-4 rounded-xl border border-primary/20 text-center">
                      <p className="text-primary font-black text-xs uppercase tracking-wider">✓ Datos Listos</p>
                    </div>                    
                    <Wallet initialization={{ preferenceId, redirectMode: "blank" }} />
                    <button onClick={() => setPreferenceId(null)} className="w-full text-[10px] uppercase text-white/20 hover:text-white pt-4">
                      ← Editar Envío
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}