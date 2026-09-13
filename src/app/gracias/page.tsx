'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

// 1. Creamos un componente interno que consuma los parámetros de la URL de forma segura
function ContenidoGracias() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const reference = searchParams.get('external_reference');
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    const check = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const url = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
        const response = await fetch(`${url}/api/pedidos/${encodeURIComponent(reference)}`, {
          headers: { Authorization: `Bearer ${token}` }, cache: 'no-store',
        });
        if (response.ok) {
          const result = await response.json();
          if (!cancelled) setStatus(result.data?.Estado || null);
          if (['Pagado', 'Enviado ', 'Entregado', 'Reembolsado', 'Contracargo', 'Cancelado', 'Pago Rechazado'].includes(result.data?.Estado)) return;
        }
      } catch { /* Retry while the webhook arrives. */ }
      if (!cancelled && ++attempts < 10) timer = setTimeout(check, 3000);
    };
    void check();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [reference]);

  return (
    <div className="text-center">
      <h1 className="text-4xl font-black uppercase italic mb-4 text-green-500">
        ¡Gracias por tu compra!
      </h1>
      {paymentId && (
        <p className="text-white/60 text-sm">
          ID de operación: <span className="text-white font-mono">{paymentId}</span>
        </p>
      )}
      {status && ['Pagado', 'Enviado ', 'Entregado'].includes(status) ? (
        <p className="mt-4 text-emerald-400 font-bold uppercase italic">Tu pago fue aprobado con éxito.</p>
      ) : (
        <p className="mt-4 text-yellow-400 font-bold uppercase italic">{status || "Estamos verificando tu pago. Puedes consultar su estado en tu perfil."}</p>
      )}
      {/* Aquí va el resto del diseño de tu página de gracias */}
    </div>
  );
}

// 2. La página principal exporta el componente envuelto en Suspense
export default function GraciasPage() {
  return (
    <div className="bg-black min-h-screen text-white flex items-center justify-center p-6">
      {/* El fallback es lo que se muestra una milésima de segundo mientras Next detecta la URL */}
      <Suspense fallback={
        <div className="text-white/50 font-black uppercase italic animate-pulse">
          Cargando detalles de tu orden...
        </div>
      }>
        <ContenidoGracias />
      </Suspense>
    </div>
  );
}

