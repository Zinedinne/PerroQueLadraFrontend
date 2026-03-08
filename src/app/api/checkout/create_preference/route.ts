import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || "" 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, pedidoId } = body; 

    const itemsFormatted = items.map((item: any) => {
      const attr = item.attributes || item;
      const p = attr.producto?.data?.attributes || attr.producto;
      return {
        id: item.id?.toString() || "id",
        title: p?.Nombre || "Producto Jauría",
        unit_price: Number(p?.Precio || 0),
        quantity: Number(attr.Cantidad || 1),
        currency_id: "MXN",
      };
    });

    const baseUrl = (process.env.NEXT_PUBLIC_URL || "http://localhost:3000").trim().replace(/\/$/, "");

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: itemsFormatted,
        payer: {}, 
        external_reference: pedidoId?.toString(),
        
        // --- ESTA ES LA LÍNEA QUE TE FALTA ---
        // Asegúrate de que esta URL sea accesible desde internet (usa tu URL de ngrok)
notification_url: "https://sina-vizierial-tennille.ngrok-free.dev/api/webhooks/mercadopago",        
        back_urls: {
          success: `${baseUrl}/gracias`,
          failure: `${baseUrl}/carrito`,
          pending: `${baseUrl}/pendiente`,
        },
      },
    });

    console.log("✅ PREFERENCIA LISTA CON WEBHOOK:", response.id);

    return NextResponse.json({ 
      preferenceId: response.id, 
      init_point: response.init_point 
    });

  } catch (error: any) {
    console.error("❌ ERROR MP:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}