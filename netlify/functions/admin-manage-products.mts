import { randomUUID } from "node:crypto";
import { getStorage } from "firebase-admin/storage";
import { adminAuth, adminDb } from "./firebase-admin.mjs";

const productCategories = new Set([
  "Outerwear",
  "Tops",
  "Trousers",
  "Shorts",
  "Accessories",
]);
const productTags = new Set(["New", "Bestseller"]);

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(
      authHeader.slice("Bearer ".length),
    );
    const userDoc = await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .get();
    return userDoc.data()?.role === "admin" ? decodedToken : null;
  } catch {
    return null;
  }
}

function isProductId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    /^[A-Za-z0-9_-]+$/.test(value)
  );
}

function validateProduct(value: unknown) {
  if (!value || typeof value !== "object") return null;

  const product = value as Record<string, unknown>;
  const name = typeof product.name === "string" ? product.name.trim() : "";
  const category =
    typeof product.category === "string" ? product.category.trim() : "";
  const price = product.price;
  const sizes = product.sizes;
  const images = product.images;
  const stockStatus =
    product.stockStatus ??
    (product.inStock === false ? "outOfStock" : "inStock");
  const stockQuantity = product.stockQuantity;

  if (
    !name ||
    name.length > 160 ||
    !category ||
    category.length > 80 ||
    !productCategories.has(category) ||
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Array.isArray(sizes) ||
    sizes.length === 0 ||
    sizes.length > 30 ||
    !sizes.every(
      (size) => typeof size === "string" && size.trim().length <= 40,
    ) ||
    !Array.isArray(images) ||
    images.length === 0 ||
    images.length > 8 ||
    !images.every(
      (image) =>
        typeof image === "string" &&
        image.length <= 2048 &&
        (image.startsWith("/") || image.startsWith("https://")),
    ) ||
    !["inStock", "lowStock", "outOfStock"].includes(String(stockStatus)) ||
    (stockStatus === "lowStock" &&
      (!Number.isInteger(stockQuantity) ||
        typeof stockQuantity !== "number" ||
        stockQuantity < 1))
  ) {
    return null;
  }

  const description =
    typeof product.description === "string" ? product.description.trim() : "";
  const material =
    typeof product.material === "string" ? product.material.trim() : "";
  const tag = typeof product.tag === "string" ? product.tag.trim() : "";

  if (
    description.length > 5000 ||
    material.length > 500 ||
    tag.length > 80
  ) {
    return null;
  }
  if (tag && !productTags.has(tag)) return null;

  return {
    name,
    price,
    category,
    description,
    material,
    sizes: sizes.map((size: string) => size.trim()).filter(Boolean),
    images,
    tag: tag || null,
    stockStatus,
    stockQuantity:
      stockStatus === "lowStock" ? stockQuantity : null,
    inStock: stockStatus !== "outOfStock",
  };
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ success: false, message: "Method not allowed." }, 405);
  }

  const isImageUpload = req
    .headers.get("content-type")
    ?.includes("multipart/form-data");

  try {
    if (!(await requireAdmin(req))) {
      return jsonResponse(
        { success: false, message: "Admin authentication required." },
        403,
      );
    }

    if (isImageUpload) {
      const formData = await req.formData();
      const productId = formData.get("productId");
      const image = formData.get("image");

      if (!isProductId(productId) || !(image instanceof File)) {
        return jsonResponse(
          { success: false, message: "A valid product and image are required." },
          400,
        );
      }

      if (
        !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
          image.type,
        ) ||
        image.size === 0 ||
        image.size > 5 * 1024 * 1024
      ) {
        return jsonResponse(
          {
            success: false,
            message: "Choose a JPG, PNG, WebP, or AVIF image up to 5 MB.",
          },
          400,
        );
      }

      const bucket = getStorage().bucket();
      if (!bucket.name) {
        throw new Error("Firebase Storage bucket is not configured.");
      }

      const extension = image.type.split("/")[1].replace("jpeg", "jpg");
      const objectPath = `products/${productId}/${randomUUID()}.${extension}`;
      const downloadToken = randomUUID();
      await bucket.file(objectPath).save(Buffer.from(await image.arrayBuffer()), {
        resumable: false,
        metadata: {
          contentType: image.type,
          metadata: { firebaseStorageDownloadTokens: downloadToken },
        },
      });

      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(objectPath)}?alt=media&token=${downloadToken}`;
      return jsonResponse({ success: true, imageUrl });
    }

    const body = await req.json();
    if (body.action !== "save") {
      return jsonResponse(
        { success: false, message: "Unsupported product action." },
        400,
      );
    }

    const product = validateProduct(body.product);
    const productId = body.product?.id;
    if (!product || (productId !== undefined && !isProductId(productId))) {
      return jsonResponse(
        { success: false, message: "Please provide valid product details." },
        400,
      );
    }

    const productRef = productId
      ? adminDb.collection("products").doc(productId)
      : adminDb.collection("products").doc();
    const existing = productId ? await productRef.get() : null;
    const data = {
      ...product,
      id: productRef.id,
      ...(existing?.exists ? {} : { createdAt: new Date() }),
      updatedAt: new Date(),
    };

    await productRef.set(data);
    return jsonResponse({ success: true, product: data });
  } catch (error) {
    console.error("Admin product management error:", error);
    if (isImageUpload) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const message = /permission denied|storage\.objects\.(create|update)|403/i.test(
        errorMessage,
      )
        ? "Firebase Storage rejected the upload. Check that the service account can create files in the configured bucket."
        : /bucket.*(missing|undefined|not configured)|bucket name/i.test(
              errorMessage,
            )
          ? "Firebase Storage is not configured. Set FIREBASE_STORAGE_BUCKET for the Netlify function."
          : "Unable to upload product image. Check the Netlify function logs for the Storage error.";
      return jsonResponse({ success: false, message }, 500);
    }

    return jsonResponse(
      { success: false, message: "Unable to save the product." },
      500,
    );
  }
};
