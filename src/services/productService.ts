import { getIdToken } from "firebase/auth";
import { auth } from "../app/firebase";
import { PRODUCTS, type Product } from "../app/components/store";

type EditableProduct = Omit<Product, "id"> & { id?: string };

interface ProductFunctionResponse {
  success: boolean;
  message?: string;
  product?: Product;
  imageUrl?: string;
  products?: unknown[];
}

async function adminHeaders() {
  const user = auth.currentUser;
  if (!user) throw new Error("Admin authentication required.");

  return { Authorization: `Bearer ${await getIdToken(user)}` };
}

export async function saveProduct(product: EditableProduct): Promise<Product> {
  const response = await fetch("/.netlify/functions/admin-manage-products", {
    method: "POST",
    headers: {
      ...(await adminHeaders()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "save", product }),
  });
  const data = (await response.json()) as ProductFunctionResponse;

  if (!response.ok || !data.success || !data.product) {
    throw new Error(data.message || "Unable to save product.");
  }

  return {
    ...data.product,
    tag:
      typeof data.product.tag === "string" ? data.product.tag : undefined,
  };
}

export async function uploadProductImage(
  productId: string,
  image: File,
): Promise<string> {
  const formData = new FormData();
  formData.set("productId", productId);
  formData.set("image", image);

  const response = await fetch("/.netlify/functions/admin-manage-products", {
    method: "POST",
    headers: await adminHeaders(),
    body: formData,
  });
  const responseText = await response.text();
  let data: ProductFunctionResponse | null = null;
  try {
    data = JSON.parse(responseText) as ProductFunctionResponse;
  } catch {
    throw new Error(
      `Image upload failed (HTTP ${response.status}). The upload service returned an invalid response.`,
    );
  }

  if (!response.ok || !data.success || !data.imageUrl) {
    throw new Error(
      data.message || `Unable to upload product image (HTTP ${response.status}).`,
    );
  }

  return data.imageUrl;
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch("/.netlify/functions/get-products");
  const data = (await response.json()) as ProductFunctionResponse;

  if (!response.ok || !data.success || !Array.isArray(data.products)) {
    throw new Error(data.message || "Unable to load products.");
  }

  return data.products.flatMap((entry): Product[] => {
    if (typeof entry !== "object" || entry === null || !("id" in entry)) {
      return [];
    }

    const productData = entry as Record<string, unknown>;
    if (typeof productData.id !== "string") return [];
    const catalogueImages = Array.isArray(productData.images)
      ? productData.images.filter(
          (image): image is string => typeof image === "string",
        )
      : [];
    const bundledImages =
      PRODUCTS.find((product) => product.id === productData.id)?.images ?? [];
    const images =
      catalogueImages.length > 0
        ? catalogueImages.map((image, index) =>
            /^\/?(?:src\/assets|assets)\//.test(image)
              ? bundledImages[index] ?? bundledImages[0] ?? image
              : image,
          )
        : bundledImages;
    const stockStatus =
      productData.stockStatus === "lowStock" ||
      productData.stockStatus === "outOfStock" ||
      productData.stockStatus === "inStock"
        ? productData.stockStatus
        : productData.inStock === false
          ? "outOfStock"
          : "inStock";

    return [
      {
        id: productData.id,
        name:
          typeof productData.name === "string"
            ? productData.name
            : "Unnamed product",
        price: typeof productData.price === "number" ? productData.price : 0,
        category:
          typeof productData.category === "string"
            ? productData.category
            : "Uncategorized",
        description:
          typeof productData.description === "string"
            ? productData.description
            : "",
        material:
          typeof productData.material === "string" ? productData.material : "",
        sizes: Array.isArray(productData.sizes)
          ? productData.sizes.filter(
              (size): size is string => typeof size === "string",
            )
          : [],
        images,
        inStock: stockStatus !== "outOfStock",
        stockStatus,
        ...(typeof productData.stockQuantity === "number"
          ? { stockQuantity: productData.stockQuantity }
          : {}),
        ...(typeof productData.tag === "string" ? { tag: productData.tag } : {}),
      },
    ];
  });
}
