import { getIdToken } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../app/firebase";
import { PRODUCTS, type Product } from "../app/components/store";

type EditableProduct = Omit<Product, "id"> & { id?: string };

interface ProductFunctionResponse {
  success: boolean;
  message?: string;
  product?: Product;
  imageUrl?: string;
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
  const data = (await response.json()) as ProductFunctionResponse;

  if (!response.ok || !data.success || !data.imageUrl) {
    throw new Error(data.message || "Unable to upload product image.");
  }

  return data.imageUrl;
}

export async function getProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, "products"));

  return snapshot.docs.map((productDocument) => {
    const data = productDocument.data();
    const images = Array.isArray(data.images)
      ? data.images.filter(
          (image): image is string => typeof image === "string",
        )
      : typeof data.image === "string"
        ? [data.image]
        : PRODUCTS.find((product) => product.id === productDocument.id)
            ?.images ?? [];

    return {
      id: productDocument.id,
      name: typeof data.name === "string" ? data.name : "Unnamed product",
      price: typeof data.price === "number" ? data.price : 0,
      category:
        typeof data.category === "string" ? data.category : "Uncategorized",
      description: typeof data.description === "string" ? data.description : "",
      material: typeof data.material === "string" ? data.material : "",
      sizes: Array.isArray(data.sizes)
        ? data.sizes.filter((size): size is string => typeof size === "string")
        : [],
      images,
      inStock:
        data.stockStatus === "outOfStock" || data.inStock === false
          ? false
          : true,
      stockStatus:
        data.stockStatus === "lowStock" ||
        data.stockStatus === "outOfStock" ||
        data.stockStatus === "inStock"
          ? data.stockStatus
          : data.inStock === false
            ? "outOfStock"
            : "inStock",
      ...(typeof data.stockQuantity === "number"
        ? { stockQuantity: data.stockQuantity }
        : {}),
      ...(typeof data.tag === "string" ? { tag: data.tag } : {}),
    };
  });
}
