import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");
    const dataID = url.searchParams.get("data.id"); // Este es el ID del pago

    if (!xSignature || !dataID) {
      return new Response("Missing security headers", { status: 400 });
    }

    // 1. VALIDACIÓN DE FIRMA (Indispensable para seguridad)
    const secret = process.env.MP_WEBHOOK_SECRET;
    const parts = xSignature.split(",");
    const ts = parts.find(p => p.startsWith("ts="))?.split("=")[1];
    const v1 = parts.find(p => p.startsWith("v1="))?.split("=")[1];
    const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;
    
    const hmac = crypto.createHmac("sha256", secret!);
    hmac.update(manifest);
    const localSignature = hmac.digest("hex");

    if (localSignature !== v1) {
      return new Response("Invalid Signature", { status: 403 });
    }

    // 2. CONSULTAR EL ESTADO REAL EN MERCADO PAGO
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataID}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });

    if (!mpRes.ok) return new Response("Error MP API", { status: 502 });
    
    const paymentData = await mpRes.json();
    
    // Extraemos la info que necesitas
    const status = paymentData.status;            // approved, pending, rejected
    const statusDetail = paymentData.status_detail; // accredited, pending_waiting_payment, etc.
    const pedidoId = paymentData.external_reference; // El ID de tu pedido en Strapi

    console.log(`🐺 WEBHOOK RECIBIDO: Pago ${dataID} | Pedido ${pedidoId} | Estado: ${status}`);

    // 3. ACTUALIZAR STRAPI CON TODA LA INFO
    if (pedidoId) {
      // Importante: Asegúrate de que estos nombres coincidan con Strapi
      const strapiRes = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/pedidos/${pedidoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRAPI_ADMIN_TOKEN}`
        },
        body: JSON.stringify({
          data: {
            MP_Payment_ID: dataID.toString(),  
            MP_Status_Detail: statusDetail,      
            Estado: status === "approved" ? "Pagado" : "Pendiente" 
          }
        })
      });

      if (strapiRes.ok) {
        console.log(`✅ Strapi actualizado: Pedido ${pedidoId} ahora está como PAGADO`);
      } else {
        const errorData = await strapiRes.json();
        console.error("❌ Error de Strapi:", errorData);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error) {
    console.error("❌ Error en el Webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}