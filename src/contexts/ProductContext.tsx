import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getProducts } from "../services/productService";
import type { Product } from "../app/components/store";

interface ProductContextValue {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  upsertProduct: (product: Product) => void;
}

const ProductContext = createContext<ProductContextValue | undefined>(
  undefined,
);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await getProducts());
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Unable to load products.";
      setError(message);
      throw loadError;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProducts().catch((loadError: unknown) => {
      console.error("Failed to load product catalogue:", loadError);
    });
  }, [refreshProducts]);

  const upsertProduct = (product: Product) => {
    setProducts((currentProducts) => {
      const exists = currentProducts.some((item) => item.id === product.id);
      return exists
        ? currentProducts.map((item) =>
            item.id === product.id ? product : item,
          )
        : [...currentProducts, product];
    });
  };

  return (
    <ProductContext.Provider
      value={{ products, loading, error, refreshProducts, upsertProduct }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
