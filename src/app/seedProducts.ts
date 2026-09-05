import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { PRODUCTS } from "./components/store";

// This function seeds the Firestore database with product data from the PRODUCTS array. It iterates over each product and adds it to the "products" collection in Firestore. If successful, it logs a success message; if there's an error, it logs the error.
export const seedProducts = async () => {
  try {
    for (const product of PRODUCTS) {
      await setDoc(doc(collection(db, "products"), product.id), {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        material: product.material,
        sizes: product.sizes,
        tag: product.tag ?? null,
      });
    }

    console.log("Products successfully added to Firestore.");
  } catch (error) {
    console.error("Error seeding products:", error);
  }
};