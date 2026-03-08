"use client";
import Link from "next/link";

export default function PendientePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="border-2 border-primary p-10 md:p-20 rounded-[3rem]">
        <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase mb-6">
          PAGO_<span className="text-primary">PENDIENTE</span>
        </h1>
        <p className="max-w-md mx-auto text-lg font-bold uppercase leading-tight">
          🐺 Lobo, tu pedido está reservado pero aún no recibimos el pago.
        </p>
        <p className="text-white/40 mt-4 text-sm uppercase">
          Si elegiste OXXO o transferencia, recuerda completar el proceso en tu app o establecimiento.
        </p>
        
        <div className="mt-10 flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/perfil" className="bg-white text-black px-8 py-4 font-black uppercase italic hover:bg-primary transition-all">
            Ir a mis pedidos
          </Link>
          <Link href="/" className="border border-white/20 text-white px-8 py-4 font-black uppercase italic hover:bg-white/10 transition-all">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}