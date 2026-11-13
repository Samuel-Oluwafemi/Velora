import { useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, Loader, Pencil, Plus, X } from "lucide-react";
import {
  saveProduct,
  uploadProductImage,
} from "../../../services/productService";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_TAGS,
  type Product,
} from "../store";

interface ProductManagerProps {
  products: Product[];
  onSaved: (product: Product, wasCreated: boolean) => void;
}

const inputClass =
  "mt-1 w-full border border-border bg-background px-3 py-2.5 text-sm focus:border-foreground focus:outline-none";

type StockStatus = "inStock" | "lowStock" | "outOfStock";

function ProductEditor({
  product,
  onClose,
  onSaved,
}: {
  product?: Product;
  onClose: () => void;
  onSaved: (product: Product, wasCreated: boolean) => void;
}) {
  const [productId] = useState(
    () => product?.id ?? `product-${crypto.randomUUID()}`,
  );
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(
    product ? String(product.price) : "",
  );
  const [category, setCategory] = useState(product?.category ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [material, setMaterial] = useState(product?.material ?? "");
  const [sizes, setSizes] = useState(product?.sizes.join(", ") ?? "");
  const [tag, setTag] = useState(product?.tag ?? "");
  const [stockStatus, setStockStatus] = useState<StockStatus>(
    product?.stockStatus ??
      (product?.inStock === false ? "outOfStock" : "inStock"),
  );
  const [stockQuantity, setStockQuantity] = useState(
    product?.stockStatus === "lowStock"
      ? String(product.stockQuantity ?? "")
      : "",
  );
  const [imageUrls, setImageUrls] = useState(product?.images.join("\n") ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const images = imageUrls
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");

    if (images.length + files.length > 8) {
      setError("A product can have up to 8 images.");
      return;
    }

    const unsupportedFile = Array.from(files).find(
      (file) =>
        !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(
          file.type,
        ),
    );
    if (unsupportedFile) {
      setError("Choose JPG, PNG, WebP, or AVIF image files.");
      return;
    }

    const oversizedFile = Array.from(files).find(
      (file) => file.size === 0 || file.size > 5 * 1024 * 1024,
    );
    if (oversizedFile) {
      setError("Each image must be greater than 0 bytes and no larger than 5 MB.");
      return;
    }

    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const file of Array.from(files)) {
        uploaded.push(await uploadProductImage(productId, file));
      }
      setImageUrls([...images, ...uploaded].join("\n"));
    } catch (uploadError) {
      if (uploaded.length) {
        setImageUrls([...images, ...uploaded].join("\n"));
      }
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Unable to upload product images.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (images.length === 0) {
      setError("Add at least one product image before saving.");
      return;
    }

    if (
      stockStatus === "lowStock" &&
      (!Number.isInteger(Number(stockQuantity)) || Number(stockQuantity) < 1)
    ) {
      setError("Enter a whole number of at least 1 for low-stock quantity.");
      return;
    }

    setSaving(true);

    try {
      const savedProduct = await saveProduct({
        id: productId,
        name: name.trim(),
        price: Number(price),
        category: category.trim(),
        description: description.trim(),
        material: material.trim(),
        sizes: sizes
          .split(",")
          .map((size) => size.trim())
          .filter(Boolean),
        images,
        tag: tag.trim() || undefined,
        stockStatus,
        stockQuantity:
          stockStatus === "lowStock" ? Number(stockQuantity) : undefined,
        inStock: stockStatus !== "outOfStock",
      });
      onSaved(savedProduct, !product);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save product.",
      );
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex h-[100dvh] w-screen items-start justify-center overflow-y-auto bg-foreground/50 p-3 sm:p-5 md:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-editor-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="relative my-2 max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto overflow-x-hidden bg-background p-4 sm:my-4 sm:p-6 md:p-8"
        aria-labelledby="product-editor-title"
      >
        <div className="sticky top-0 z-10 -mx-4 -mt-4 mb-5 flex items-start justify-between gap-4 border-b border-border bg-background px-4 py-4 sm:-mx-6 sm:-mt-6 sm:px-6 md:-mx-8 md:-mt-8 md:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Product catalogue
            </p>
            <h2
              id="product-editor-title"
              className="mt-1 text-2xl text-foreground"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {product ? "Edit product" : "Add product"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-border bg-background text-foreground hover:bg-muted"
            aria-label="Close product editor"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <p
            className="mb-5 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground md:col-span-2">
            Product name
            <input
              required
              maxLength={160}
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">
            Price (NGN)
            <input
              required
              type="number"
              min="1"
              step="1"
              className={inputClass}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">
            Category
            <select
              required
              className={inputClass}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="" disabled>
                Select a category
              </option>
              {PRODUCT_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">
            Sizes
            <input
              required
              className={inputClass}
              value={sizes}
              onChange={(event) => setSizes(event.target.value)}
              placeholder="S, M, L, XL (or One size)"
            />
          </label>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">
            Tag (optional)
            <select
              className={inputClass}
              value={tag}
              onChange={(event) => setTag(event.target.value)}
            >
              <option value="">No tag</option>
              {PRODUCT_TAGS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs uppercase tracking-wider text-muted-foreground md:col-span-2">
            Description
            <textarea
              rows={3}
              maxLength={5000}
              className={inputClass}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <label className="text-xs uppercase tracking-wider text-muted-foreground md:col-span-2">
            Material
            <input
              maxLength={500}
              className={inputClass}
              value={material}
              onChange={(event) => setMaterial(event.target.value)}
            />
          </label>
        </div>

        <div className="mt-5">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">
            Product images
            <textarea
              rows={3}
              className={inputClass}
              value={imageUrls}
              onChange={(event) => setImageUrls(event.target.value)}
              placeholder="Image URLs, one per line. You can also upload image files below."
            />
          </label>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 border border-border px-3 py-2 text-xs uppercase tracking-wider hover:bg-muted">
              {uploading ? (
                <Loader size={14} className="animate-spin" />
              ) : (
                <ImagePlus size={14} />
              )}
              {uploading ? "Uploading…" : "Upload images"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                className="sr-only"
                disabled={uploading || saving}
                onChange={(event) => {
                  void handleImageUpload(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
            <span className="text-xs text-muted-foreground">
              JPG, PNG, WebP or AVIF, up to 5 MB each (8 images max)
            </span>
          </div>
          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative h-24 w-20 overflow-hidden border border-border bg-muted"
                >
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImageUrls(
                        images.filter((_, imageIndex) => imageIndex !== index)
                          .join("\n"),
                      )
                    }
                    className="absolute right-1 top-1 bg-background/90 p-1"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground">
            Stock status
            <select
              className={inputClass}
              value={stockStatus}
              onChange={(event) =>
                setStockStatus(event.target.value as StockStatus)
              }
            >
              <option value="inStock">In stock</option>
              <option value="lowStock">Low stock</option>
              <option value="outOfStock">Out of stock</option>
            </select>
          </label>
          {stockStatus === "lowStock" && (
            <label className="text-xs uppercase tracking-wider text-muted-foreground">
              Quantity remaining
              <input
                required
                type="number"
                min="1"
                step="1"
                className={inputClass}
                value={stockQuantity}
                onChange={(event) => setStockQuantity(event.target.value)}
                placeholder="Enter available units"
              />
            </label>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={onClose}
            className="border border-border px-5 py-3 text-xs uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex min-w-36 items-center justify-center gap-2 bg-foreground px-5 py-3 text-xs uppercase tracking-wider text-background disabled:opacity-50"
          >
            {saving && <Loader size={14} className="animate-spin" />}
            {saving ? "Saving…" : "Save product"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}

export function ProductManager({ products, onSaved }: ProductManagerProps) {
  const [editorProduct, setEditorProduct] = useState<Product | null | undefined>(
    null,
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted-foreground" style={{ fontSize: "0.82rem" }}>
          {products.length} {products.length === 1 ? "product" : "products"}
        </p>
        <button
          type="button"
          onClick={() => setEditorProduct(undefined)}
          className="inline-flex items-center gap-2 bg-foreground px-4 py-3 text-xs uppercase tracking-wider text-background"
        >
          <Plus size={15} />
          Add product
        </button>
      </div>

      <div
        className="overflow-hidden bg-secondary"
        style={{ border: "1px solid #E5E7EB" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px]">
            <thead>
              <tr>
                {["Product", "Category", "Price", "Sizes", "Stock", "Edit"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-5 py-3 text-left text-muted-foreground"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.68rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-t border-border"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt=""
                          className="h-12 w-10 object-cover"
                        />
                      ) : (
                        <div className="h-12 w-10 bg-muted" />
                      )}
                      <span className="text-sm">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">
                    {product.category}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    ₦{product.price.toLocaleString("en-NG")}
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">
                    {product.sizes.join(", ") || "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs ${
                        product.stockStatus === "outOfStock" ||
                        product.inStock === false
                          ? "text-red-700"
                          : product.stockStatus === "lowStock"
                            ? "text-amber-700"
                            : "text-emerald-700"
                      }`}
                    >
                      {product.stockStatus === "outOfStock" ||
                      product.inStock === false
                        ? "Out of stock"
                        : product.stockStatus === "lowStock"
                          ? `Low stock (${product.stockQuantity ?? 0})`
                          : "In stock"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setEditorProduct(product)}
                      className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs hover:bg-muted"
                      aria-label={`Edit ${product.name}`}
                    >
                      <Pencil size={13} />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {!products.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-muted-foreground"
                  >
                    No products yet. Add your first product to the catalogue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editorProduct !== null && (
        <ProductEditor
          key={editorProduct?.id ?? "new-product"}
          product={editorProduct ?? undefined}
          onClose={() => setEditorProduct(null)}
          onSaved={(product, wasCreated) => {
            onSaved(product, wasCreated);
            setEditorProduct(null);
          }}
        />
      )}
    </div>
  );
}
