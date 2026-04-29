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
  // 1. LOG DE DEPURACIÓN: Ver qué llega exactamente
  console.log("Revisando item:", item);

  // 2. EXTRACCIÓN ROBUSTA DEL PRECIO
  // Buscamos en todas las posibles ubicaciones (Tienda o Boletos)
  let rawPrice = 
    item.unit_price || 
    item.Precio || 
    item.attributes?.producto?.data?.attributes?.Precio || 
    (item.attributes?.Total / item.attributes?.Cantidad);

  // 3. LIMPIEZA Y CONVERSIÓN
  // Convertimos a número, eliminamos decimales extra y aseguramos que no sea NaN
  const cleanPrice = parseFloat(Number(rawPrice).toFixed(2));

  // 4. VALIDACIÓN CRÍTICA
  if (isNaN(cleanPrice) || cleanPrice <= 0) {
    console.error("❌ PRECIO INVÁLIDO DETECTADO:", rawPrice);
    // Asignamos un precio mínimo o lanzamos error para que no truene MP
    throw new Error(`El producto ${item.title || 'Inscripción'} no tiene un precio válido.`);
  }

  return {
    id: item.id?.toString() || "pql-item",
    title: item.title || item.Nombre || "Inscripción Perro Que Ladra",
    unit_price: cleanPrice,
    quantity: parseInt(item.quantity || item.Cantidad || 1),
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