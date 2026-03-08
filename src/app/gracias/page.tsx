"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function GraciasPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-7xl md:text-9xl font-black italic text-primary uppercase animate-bounce">
        ¡LISTO!
      </h1>
      <h2 className="text-2xl md:text-4xl font-black uppercase mt-4">Bienvenido a la Jauría</h2>
      <p className="text-white/40 mt-6 font-mono uppercase tracking-widest">
        Tu pago ha sido aprobado con éxito.
      </p>
      {paymentId && (
        <span className="text-[10px] text-white/20 mt-2 font-mono">ID: {paymentId}</span>
      )}
      
      <Link href="/perfil" className="mt-12 bg-white text-black px-10 py-4 font-black uppercase italic hover:bg-primary transition-all">
        Ver mis pedidos
      </Link>
    </main>
  );
}