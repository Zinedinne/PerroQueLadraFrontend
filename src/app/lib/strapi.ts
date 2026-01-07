export async function fetchStrapi(endpoint: string) {
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://127.0.0.1:1337";
  const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

  try {
    const url = `${STRAPI_URL}/api/${endpoint}`;
    console.log("Consultando:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
      cache: 'no-store', 
    });

    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType?.includes("application/json")) {
      console.error(`Error ${response.status}: No se encontró el endpoint ${endpoint}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error de red:", error);
    return null;
  }
} 