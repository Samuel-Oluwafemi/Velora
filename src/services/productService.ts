import { collection, getDocs } from "firebase/firestore";
import { db } from "../app/firebase";
import type { Product } from "../app/components/store";

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
        : [];

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
      ...(typeof data.tag === "string" ? { tag: data.tag } : {}),
    };
  });
}
