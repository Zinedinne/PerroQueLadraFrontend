"use client";
import { Payment } from '@mercadopago/sdk-react';

export default function MPBrick({ amount, onSubmit }: any) {
  // Obtenemos el email del usuario logueado para el pago
  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const userEmail = user.email || user.user?.email || "test_user@testuser.com";

  return (
    <div className="w-full bg-white rounded-3xl p-4 shadow-xl">
      <Payment
        initialization={{
          amount: Math.round(amount),
          payer: {
            email: userEmail,
          },
        }}
        customization={{
          visual: {
            
            hideFormTitle: false,
            hideStatusScreen: true,
            theme: 'default', // Cambiado a default para mejor visibilidad en el cuadro blanco
          },
          paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            mercadoPago: "all",
          },
        }}
        onSubmit={onSubmit}
        onError={(error) => console.error("Error en el Brick:", error)}
      />
    </div>
  );
}