import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const accessToken = process.env.MP_ACCESS_TOKEN;

    console.log("--- PROCESANDO PAGO LIMPIO ---");

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "X-Idempotency-Key": `jauria-${Date.now()}`
      },
      body: JSON.stringify({
        token: body.token,
        issuer_id: body.issuer_id,
        payment_method_id: body.payment_method_id,
        transaction_amount: Number(body.transaction_amount),
        installments: Number(body.installments),
        description: body.description,
        external_reference: body.external_reference?.toString(),
        payer: {
    email: body.payer?.email || "test_user_3148809930@testuser.com", 
  },
        // ❌ ELIMINAMOS EL OBJETO PAYER TOTALMENTE
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.log("❌ ERROR MP:", JSON.stringify(result, null, 2));
      return NextResponse.json(result, { status: response.status });
    }

    console.log("✅ PAGO APROBADO:", result.status);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("❌ ERROR CRÍTICO:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}