"use client";
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

// Asegúrate de que esta variable no sea undefined
if (process.env.NEXT_PUBLIC_MP_PUBLIC_KEY) {
  initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY);
}

export default function PaymentBrick({ amount, pedidoId, email }: any) {
  
  const initialization = {
    amount: Number(amount),
    payer: { email: email },
  };

  const customization: any = { // Usamos :any temporalmente si TS sigue molestando
    visual: {
      style: {
        theme: 'dark',
      },
    },
    paymentMethods: {
      maxInstallments: 1,
    }
  };

  const onSubmit = async ({ formData }: any) => {
    // ... tu lógica de fetch a /api/process_payment
  };

  return (
    <div id="payment-brick-container">
      <Payment
        initialization={initialization}
        customization={customization}
        onSubmit={onSubmit}
      />
    </div>
  );
}