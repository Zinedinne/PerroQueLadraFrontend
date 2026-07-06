'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// 1. Creamos un componente interno que consuma los parámetros de la URL de forma segura
function ContenidoGracias() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

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
      {status === 'approved' ? (
        <p className="mt-4 text-emerald-400 font-bold uppercase italic">Tu pago fue aprobado con éxito.</p>
      ) : (
        <p className="mt-4 text-yellow-400 font-bold uppercase italic">Estamos procesando tu pago.</p>
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

