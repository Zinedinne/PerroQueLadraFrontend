import { NextResponse } from "next/server";

const STATUS_MAP: Record<string, string> = {
  approved: "Pagado",
  pending: "Pendiente de Pago",
  in_process: "En Revisión",
  rejected: "Pago Rechazado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
  charged_back: "Contracargo",
};

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("data.id");
    const type = searchParams.get("type");

    if (type === "payment" && paymentId) {
      // 1. Consultar a Mercado Pago
      const resMP = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
        cache: 'no-store'
      });

      if (!resMP.ok) return new Response("Error MP API", { status: 502 });

      const data = await resMP.json();
      
      // La clave está aquí: ¿Qué guardamos en el external_reference?
      const referenceId = data.external_reference; 
      const mpStatus = data.status;
      const mpStatusDetail = data.status_detail;
      const estadoFinal = STATUS_MAP[mpStatus] || mpStatus;

      if (!referenceId || referenceId === "null") {
        console.warn("⚠️ Webhook sin external_reference.");
        return new Response("OK", { status: 200 });
      }

      // 2. Determinar si es un Boleto o un Pedido
      // Si usas el documentId de Strapi 5, podemos intentar identificarlo 
      // o simplemente probar en ambas colecciones.
      
      let collection = "pedidos"; // Por defecto
      
      // Lógica de detección: 
      // Si en tu frontend de Boletos mandas la referencia con un prefijo tipo "BOL_",
      // aquí podrías separar: if (referenceId.startsWith("BOL_")) ...
      // Si mandas el documentId directo, probaremos primero con Boletos:

      console.log(`🐺 Procesando Ref: ${referenceId} -> Estado: ${estadoFinal}`);

      // Intentamos actualizar en BOLETOS primero
      let strapiRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/boletos/${referenceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` 
        },
        body: JSON.stringify({
          data: {
            MP_Status_Detail: estadoFinal === "Pagado" ? "Pagado" : mpStatusDetail,
            MP_Payment_ID: paymentId.toString(),
          }
        })
      });

      // Si falla boletos (404), intentamos con PEDIDOS
      if (strapiRes.status === 404) {
        console.log("ℹ️ No es un Boleto, intentando con Pedidos...");
        strapiRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/pedidos/${referenceId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` 
          },
          body: JSON.stringify({
            data: {
              Estado: estadoFinal,
              MP_Payment_ID: paymentId.toString(),
              MP_Status_Detail: mpStatusDetail,
            }
          })
        });
      }

      if (!strapiRes.ok) {
        console.error(`❌ Error actualizando Strapi para ID ${referenceId}`);
        return new Response("Error Strapi Update", { status: 500 });
      }

      console.log(`✅ Registro ${referenceId} actualizado con éxito.`);
    }

    return new Response("OK", { status: 200 });

  } catch (error: any) {
    console.error("❌ Error crítico en Webhook:", error.message);
    return new Response("Internal Error", { status: 500 });
  }
}