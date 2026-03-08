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
    console.log("DEBUG TOKEN:", {
  url: process.env.NEXT_PUBLIC_STRAPI_URL,
  tokenExists: !!process.env.STRAPI_ADMIN_TOKEN,
  tokenLength: process.env.STRAPI_ADMIN_TOKEN?.length
});
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("data.id");
    const type = searchParams.get("type");

    // Solo procesamos si el evento es de tipo payment
    if (type === "payment" && paymentId) {
      
      // 1. Consultar el estado real a la API de Mercado Pago
      const resMP = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
        cache: 'no-store'
      });

      if (!resMP.ok) {
        console.error("❌ Error al consultar MP:", await resMP.text());
        return new Response("Error MP API", { status: 502 });
      }

      const data = await resMP.json();
      
      console.log("🔍 DATOS COMPLETOS RECIBIDOS DE MP:", JSON.stringify(data, null, 2));
      const pedidoId = data.external_reference; // El ID que guardamos en el frontend
      const mpStatus = data.status;             // Estado de MP
      const mpStatusDetail = data.status_detail; // Detalle técnico del estado

      if (pedidoId && pedidoId !== "null") {
        
        // 2. Mapear el estado de MP a nuestro estado de Strapi
        const estadoFinal = STATUS_MAP[mpStatus] || mpStatus;

        console.log(`🐺 Procesando Pedido ${pedidoId}: Estado MP: ${mpStatus} -> Estado Final: ${estadoFinal}`);

        // 3. ACTUALIZACIÓN ÚNICA EN STRAPI
        const strapiRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/pedidos/${pedidoId}`, {
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
              // Opcional: podrías guardar la fecha de actualización de pago
            }
          })
        });

        if (!strapiRes.ok) {
          const errorStrapi = await strapiRes.json();
          console.error("❌ Error actualizando Strapi:", errorStrapi);
          return new Response("Error Strapi Update", { status: 500 });
        }

        console.log(`✅ Registro actualizado: Pedido ${pedidoId} ahora está en [${estadoFinal}]`);
      } else {
        console.warn("⚠️ Webhook recibido sin external_reference (pedidoId).");
      }
    }

    // Mercado Pago necesita recibir un 200 u OK para dejar de enviar el webhook
    return new Response("OK", { status: 200 });

  } catch (error: any) {
    console.error("❌ Error crítico en Webhook:", error.message);
    return new Response("Internal Error", { status: 500 });
  }
}