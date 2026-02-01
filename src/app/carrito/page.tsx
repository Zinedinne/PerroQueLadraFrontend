"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { formatManualPrice } from "../format"; 
import Link from "next/link";
import dynamic from "next/dynamic";
import { initMercadoPago } from '@mercadopago/sdk-react';
import { MERCADO_PAGO_MESSAGES } from "../constants/mercadoPagoMessages";
import { toast } from "sonner"; // <--- Importamos toast

const MercadoPagoBrick = dynamic(() => import("../components/MPBrick"), { 
  ssr: false,
  loading: () => <div className="p-10 text-center font-black italic text-white animate-pulse">INICIALIZANDO SEGURIDAD...</div>
});

const mpPublicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || '';

export default function CarritoPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [pedidoId, setPedidoId] = useState<number | null>(null);
  const [showBrick, setShowBrick] = useState(false);
  const [shippingData, setShippingData] = useState({
    nombre: "", telefono: "", calle: "", numero: "", estado: "", cp: "", referencia: ""
  });

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";

  useEffect(() => {
    if (typeof window !== 'undefined' && mpPublicKey) {
      initMercadoPago(mpPublicKey, { locale: 'es-MX' });
    }
  }, []);

  useEffect(() => {
    if (!loading && items.length === 0 && !isCheckingOut) {
      setShowBrick(false);
    }
  }, [items, loading, isCheckingOut]);

  // ... (fetchCart, handleInputChange, total se mantienen igual)
  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userStorage = localStorage.getItem("user");
    if (!token || !userStorage) { setLoading(false); return; }
    const user = JSON.parse(userStorage);
    const userId = user.id || user.user?.id;
    try {
      const query = new URLSearchParams({
        "filters[cliente][id][$eq]": userId.toString(),
        "populate[producto][populate]": "Imagen",
        "pagination[limit]": "100",
      });
      const res = await fetch(`${STRAPI_URL}/api/carritos?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const responseData = await res.json();
      setItems(responseData.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [STRAPI_URL]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleInputChange = (e: any) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  const total = useMemo(() => {
    return items.reduce((acc, item: any) => {
      const data = item.attributes || item;
      const producto = data.producto?.data?.attributes || data.producto;
      return acc + ((producto?.Precio || 0) * (data.Cantidad || 0));
    }, 0);
  }, [items]);

  const limpiarCarrito = async () => {
    const token = localStorage.getItem("token");
    try {
      await Promise.all(items.map(async (item: any) => {
        const id = item.documentId || item.id;
        await fetch(`${STRAPI_URL}/api/carritos/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      }));
    } catch (err) { console.error("Error al limpiar carrito:", err); }
  };

  const handleCheckout = async () => {
    if (!shippingData.nombre || !shippingData.calle || shippingData.cp.length < 5) {
      toast.warning("🐺 INFORMACIÓN INCOMPLETA", {
        description: "La Jauría necesita tus datos de envío para continuar."
      });
      return;
    }
    setIsCheckingOut(true);
    // ... (Lógica de creación de pedido en Strapi se mantiene igual)
    const token = localStorage.getItem("token");
    const userStorage = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userStorage.id || userStorage.user?.id;

    const pedidoData = {
      data: {
        Estado: "Pendiente",
        users_permissions_user: userId,
        total: total,
        Metodo_Pago: "Mercado Pago",
        Nombre_Completo: shippingData.nombre,
        Telefono: shippingData.telefono,
        Calle: shippingData.calle,
        Numero_Casa: shippingData.numero,
        Estado_Pais: shippingData.estado,
        Codigo_Postal: shippingData.cp,
        Referencias: shippingData.referencia
      }
    };

    try {
      const resStrapi = await fetch(`${STRAPI_URL}/api/pedidos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(pedidoData)
      });
      const result = await resStrapi.json();
      if (resStrapi.ok) {
        setPedidoId(result.data.id);
        setShowBrick(true);
        toast.info("ENVÍO CONFIRMADO", { description: "Selecciona tu método de pago." });
      }
    } catch (err) { 
      toast.error("ERROR DE SERVIDOR", { description: "No pudimos registrar tu pedido." });
    } finally { setIsCheckingOut(false); }
  };

  // --- FUNCIÓN DE PAGO ACTUALIZADA ---
  const onPaymentSubmit = async ({ formData }: any) => {
    const toastId = toast.loading("🐺 VALIDANDO CON LA JAURÍA...", {
      description: "Procesando tu pago de forma segura."
    });

    return new Promise<void>(async (resolve, reject) => {
      try {
        setIsCheckingOut(true); 

        const res = await fetch("/api/checkout/process_payment", { 
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            external_reference: pedidoId?.toString(),
            description: `Compra Jauría #${pedidoId}`,
          }),
        });

        const data = await res.json();

        const feedback = MERCADO_PAGO_MESSAGES[data.status_detail] || 
                         MERCADO_PAGO_MESSAGES[data.status] || 
                         MERCADO_PAGO_MESSAGES["rejected"];

        // CASO 1: PAGO APROBADO (Success)
        if (res.ok && data.status === "approved") {
          toast.success(feedback.title, { id: toastId, description: feedback.description });
          
          await limpiarCarrito(); // Limpiamos porque ya se pagó
          setItems([]); 
          resolve();
          
          setTimeout(() => {
            window.location.replace("/perfil?status=success");
          }, 1500);
        } 
        
        // CASO 2: PAGO PENDIENTE O EN PROCESO (OXXO, SPEI, Revisión)
        else if (res.ok && (data.status === "pending" || data.status === "in_process")) {
          toast.warning(feedback.title, { id: toastId, description: feedback.description });
          
          // IMPORTANTE: NO limpiamos el carrito aquí. 
          // El usuario podría necesitar intentar con otra tarjeta si se arrepiente del OXXO.
          
          resolve(); // Resolvemos para que el Brick no marque error

          setTimeout(() => {
            // Mandamos a una página de "Pendiente" o al perfil con aviso
            window.location.replace("/perfil?status=pending");
          }, 2000);
        }

        // CASO 3: RECHAZADO O ERROR
        else {
          toast.error(feedback.title, { id: toastId, description: feedback.description });
          setIsCheckingOut(false);
          reject(); // El Brick permitirá al usuario intentar de nuevo
        }
      } catch (err) {
        toast.error("ERROR CRÍTICO", { id: toastId, description: "Error de conexión." });
        setIsCheckingOut(false);
        reject();
      }
    });
  };

  if (loading) return <div className="min-h-screen bg-black text-primary flex items-center justify-center font-black italic text-4xl uppercase">Cargando_Jauría...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-20 font-sans">
      {/* ... (El resto del JSX se mantiene igual) */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter mb-12">
          TU_<span className="text-primary">CARRITO</span>
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 border-t border-white/10">
            <p className="text-white/40 mb-8 uppercase italic font-bold">El carrito está vacío, lobo.</p>
            <Link href="/productos/catalog" className="bg-white text-black px-12 py-5 font-black uppercase italic hover:bg-primary transition-all">Ir al Catálogo</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-12">
              {!showBrick ? (
                <div className="bg-zinc-900/30 p-10 rounded-[2rem] border border-white/5 space-y-8 shadow-2xl">
                  <h2 className="text-3xl font-black uppercase italic text-primary">1. Datos de Envío_</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
                    <input name="nombre" placeholder="NOMBRE COMPLETO" onChange={handleInputChange} className="md:col-span-2 bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-primary transition-all uppercase" />
                    <input name="telefono" placeholder="TELÉFONO" onChange={handleInputChange} className="bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-primary transition-all" />
                    <input name="cp" placeholder="CÓDIGO POSTAL" onChange={handleInputChange} className="bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-primary transition-all" />
                    <input name="calle" placeholder="CALLE" onChange={handleInputChange} className="bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-primary transition-all uppercase" />
                    <input name="numero" placeholder="NÚMERO EXT/INT" onChange={handleInputChange} className="bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-primary transition-all" />
                    <input name="estado" placeholder="ESTADO" onChange={handleInputChange} className="md:col-span-2 bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-primary transition-all uppercase" />
                    <textarea name="referencia" placeholder="REFERENCIAS ADICIONALES" onChange={handleInputChange} className="md:col-span-2 bg-black border border-white/10 p-5 rounded-2xl outline-none focus:border-primary min-h-[120px] transition-all uppercase" />
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900 p-8 rounded-[2rem] shadow-2xl border border-primary/20">
                    <h2 className="text-2xl font-black uppercase italic mb-6 text-primary">2. Información de Pago_</h2>
                    <MercadoPagoBrick amount={total} onSubmit={onPaymentSubmit} />
                    <button onClick={() => setShowBrick(false)} className="mt-8 flex items-center gap-2 text-[11px] text-white/30 font-black uppercase tracking-widest hover:text-primary transition-colors">
                      ← Regresar a datos de envío
                    </button>
                </div>
              )}

              {/* PRODUCTOS */}
              <div className="space-y-6 pt-10">
                {items.map((item: any) => {
                  const data = item.attributes || item;
                  const pAttr = data.producto?.data?.attributes || data.producto;
                  return (
                    <div key={item.id} className="flex gap-8 border-b border-white/5 pb-8 items-center group">
                      <div className="flex-1">
                        <h3 className="font-black uppercase italic text-lg">{pAttr?.Nombre}</h3>
                        <p className="text-primary font-mono text-xl font-black">{formatManualPrice(pAttr?.Precio)}</p>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Cantidad: {data.Cantidad}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RESUMEN */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 p-10 rounded-[2.5rem] border border-white/5 sticky top-32 shadow-2xl">
                <div className="flex justify-between items-end mb-12">
                  <span className="text-[10px] font-black uppercase text-white/30">Total Final</span>
                  <span className="text-5xl font-black text-primary italic leading-none">{formatManualPrice(total)}</span>
                </div>

                {!showBrick && (
                   <button onClick={handleCheckout} disabled={isCheckingOut} className="w-full bg-white text-black font-extrabold uppercase italic py-6 rounded-2xl hover:bg-primary transition-all text-xl">
                   {isCheckingOut ? "Registrando..." : "Confirmar Envío →"}
                 </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}