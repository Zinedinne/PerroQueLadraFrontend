"use client";
import { useEffect, useRef } from "react";

export default function MPBrick({ amount, onSubmit }: { amount: number; onSubmit: (formData: any) => Promise<void> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const brickController = useRef<any>(null);
  const isInitializing = useRef(false);
  const containerId = "mercadopago-brick-container";

  useEffect(() => {
    if (!amount || amount <= 0 || isInitializing.current) return;

    const renderBrick = async () => {
      if (!(window as any).MercadoPago || !containerRef.current) return;

      try {
        isInitializing.current = true;
        
        // Limpiar duplicados físicos
        const container = document.getElementById(containerId);
        if (container) container.innerHTML = "";

        const mp = new (window as any).MercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY, { locale: "es-MX" });
        const bricksBuilder = mp.bricks();

        brickController.current = await bricksBuilder.create("payment", containerId, {
          initialization: {
            amount: Math.round(amount),
            payer: { email: JSON.parse(localStorage.getItem("user") || "{}")?.email || "comprador@jauria.com" },
          },
          customization: {
            visual: { hideFormTitle: true, preserveStyle: true },
            paymentMethods: { creditCard: "all", debitCard: "all" },
          },
          callbacks: {
            onReady: () => { isInitializing.current = false; },
            onSubmit: async (formData: any) => await onSubmit(formData),
            onError: (error: any) => { 
                console.error(error);
                isInitializing.current = false; 
            },
          },
        });
      } catch (e) {
        isInitializing.current = false;
      }
    };

    renderBrick();

    return () => {
      if (brickController.current) {
        brickController.current.unmount();
        brickController.current = null;
      }
      isInitializing.current = false;
    };
  }, [amount]);

  return <div id={containerId} ref={containerRef} className="w-full"></div>;
}