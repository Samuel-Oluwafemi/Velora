import { adminDb } from "./firebase-admin.mjs";

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  });

export default async (req: Request) => {
  if (req.method !== "GET") {
    return jsonResponse({ success: false, message: "Method not allowed." }, 405);
  }

  try {
    const snapshot = await adminDb.collection("products").get();
    const products = snapshot.docs.map((productDocument) => {
      const data = productDocument.data();
      const images = Array.isArray(data.images)
        ? data.images.filter((image): image is string => typeof image === "string")
        : typeof data.image === "string"
          ? [data.image]
          : [];

      return {
        id: productDocument.id,
        name: data.name,
        price: data.price,
        category: data.category,
        description: data.description,
        material: data.material,
        sizes: data.sizes,
        images,
        tag: data.tag ?? null,
        inStock: data.inStock,
        stockStatus: data.stockStatus,
        stockQuantity: data.stockQuantity,
      };
    });

    return jsonResponse({ success: true, products });
  } catch (error) {
    console.error("Public product catalogue error:", error);
    return jsonResponse(
      { success: false, message: "Unable to load products." },
      500,
    );
  }
};
