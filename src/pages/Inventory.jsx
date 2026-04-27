import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { BarcodePreview, QrPreview } from "../components/ui/CodePreview";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";
import Skeleton, { TableSkeleton } from "../components/ui/Skeleton";
import Table, { TableEmpty, TableHead } from "../components/ui/Table";
import { useToast } from "../context/ToastContext";
import useProducts from "../hooks/useProducts";
import { addProduct, deleteProduct, updateProduct } from "../services/mockApi";
import { formatCurrency } from "../utils/formatCurrency";
import { resolveProductBarcode } from "../utils/productCodes";

const categories = [
  "Apparel",
  "Footwear",
  "Accessories",
  "Electronics",
  "Food & Beverage",
  "Health & Beauty",
  "Sports & Fitness",
  "Home & Living",
  "Books & Stationery",
  "Toys & Games",
  "Automotive",
  "Office Supplies",
  "Jewelry",
  "Baby & Kids",
  "Pet Supplies",
];

const CATEGORY_PREFIXES = {
  "Apparel": "APP",
  "Footwear": "FTW",
  "Accessories": "ACC",
  "Electronics": "ELC",
  "Food & Beverage": "FDB",
  "Health & Beauty": "HLB",
  "Sports & Fitness": "SPT",
  "Home & Living": "HML",
  "Books & Stationery": "BKS",
  "Toys & Games": "TOY",
  "Automotive": "AUT",
  "Office Supplies": "OFS",
  "Jewelry": "JWL",
  "Baby & Kids": "BBY",
  "Pet Supplies": "PET",
};

function generateSku(name, category, existingProducts) {
  const prefix = CATEGORY_PREFIXES[category] ?? category.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  const words = name.trim().split(/\s+/).filter(Boolean);
  const keyword = (words[words.length - 1] ?? "XX").slice(0, 2).toUpperCase().padEnd(2, "X");
  const next = String(existingProducts.length + 1).padStart(3, "0");
  return `${prefix}-${keyword}-${next}`;
}

const emptyForm = {
  barcode: "",
  category: "Apparel",
  cost_price: "",
  name: "",
  selling_price: "",
  sku: "",
  stock: "",
};

function getStockTone(stock) {
  if (stock < 10) return "danger";
  if (stock < 20) return "warning";
  return "success";
}

export default function Inventory() {
  const { loading, products, refresh } = useProducts();
  const { showToast } = useToast();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [skuTouched, setSkuTouched] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (editingProduct || skuTouched || !form.name.trim()) return;
    setForm((current) => ({ ...current, sku: generateSku(form.name, form.category, products) }));
  }, [form.name, form.category, editingProduct, skuTouched, products]);

  const filteredProducts = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = category === "All" || product.category === category;
      const matchesQuery =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        resolveProductBarcode(product).toLowerCase().includes(search);
      return matchesCategory && matchesQuery;
    });
  }, [category, deferredQuery, products]);

  const closeModal = () => {
    setErrors({});
    setEditingProduct(null);
    setForm(emptyForm);
    setSkuTouched(false);
    setModalOpen(false);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setErrors({});
    setForm(emptyForm);
    setSkuTouched(false);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setErrors({});
    setForm({
      barcode: product.barcode ?? "",
      category: product.category,
      cost_price: String(product.cost_price),
      name: product.name,
      selling_price: String(product.selling_price),
      sku: product.sku,
      stock: String(product.stock),
    });
    setModalOpen(true);
  };

  const validate = () => {
    const nextErrors = {};
    const trimmedSku = form.sku.trim().toLowerCase();
    const duplicate = products.find(
      (product) => product.id !== editingProduct?.id && product.sku.toLowerCase() === trimmedSku,
    );
    const trimmedBarcode = form.barcode.trim().toLowerCase();
    const duplicateBarcode = trimmedBarcode
      ? products.find(
          (product) =>
            product.id !== editingProduct?.id &&
            resolveProductBarcode(product).toLowerCase() === trimmedBarcode,
        )
      : null;

    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.sku.trim()) nextErrors.sku = "SKU is required.";
    if (duplicate) nextErrors.sku = "This SKU already exists.";
    if (duplicateBarcode) nextErrors.barcode = "This barcode is already assigned.";
    if (!form.category) nextErrors.category = "Category is required.";
    if (Number(form.cost_price) <= 0) nextErrors.cost_price = "Cost price must be greater than zero.";
    if (Number(form.selling_price) <= 0) nextErrors.selling_price = "Selling price must be greater than zero.";
    if (Number(form.stock) < 0 || form.stock === "") nextErrors.stock = "Stock must be zero or more.";

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      showToast("Please correct the form errors before saving.", "error");
      return;
    }

    const payload = {
      barcode: form.barcode.trim().toUpperCase(),
      category: form.category,
      cost_price: Number(form.cost_price),
      name: form.name.trim(),
      selling_price: Number(form.selling_price),
      sku: form.sku.trim().toUpperCase(),
      stock: Number(form.stock),
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        showToast("Product updated successfully.", "success");
      } else {
        await addProduct(payload);
        showToast("Product added successfully.", "success");
      }
      closeModal();
      startTransition(() => refresh());
    } catch (error) {
      showToast(error.message || "Unable to save product.", "error");
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Delete ${product.name}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(product.id);
      showToast("Product deleted.", "success");
      startTransition(() => refresh());
    } catch (error) {
      showToast(error.message || "Unable to delete product.", "error");
    }
  };

  const margin = form.cost_price && form.selling_price
    ? (((Number(form.selling_price) - Number(form.cost_price)) / Number(form.selling_price)) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-bold text-text">Inventory</h2>
          <Badge tone="primary">{products.length} products</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-[1.1fr_0.8fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-10"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or SKU"
              value={query}
            />
          </div>
          <Select onChange={(event) => setCategory(event.target.value)} value={category}>
            <option value="All">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </section>

      {loading ? (
        <TableSkeleton columns={7} rows={6} />
      ) : filteredProducts.length ? (
        <Table>
          <TableHead columns={["Product", "Category", "Stock", "Cost Price", "Selling Price", "Margin %", "Actions"]} />
          <tbody className="divide-y divide-border">
            {filteredProducts.map((product) => {
              const computedMargin = ((product.selling_price - product.cost_price) / product.selling_price) * 100;
              return (
                <tr
                  key={product.id}
                  className={`interactive-row ${product.stock < 10 ? "border-l-4 border-l-amber-300" : ""}`}
                >
                  <td className="px-4 py-4">
                    <p className="font-semibold text-text">{product.name}</p>
                    <p className="mt-1 font-mono text-xs text-muted">{product.sku}</p>
                    <p className="mt-1 font-mono text-[11px] text-primary">{resolveProductBarcode(product)}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{product.category}</td>
                  <td className="px-4 py-4">
                    <Badge tone={getStockTone(product.stock)}>{product.stock} units</Badge>
                  </td>
                  <td className="px-4 py-4 text-sm tabular-nums text-muted">{formatCurrency(product.cost_price)}</td>
                  <td className="px-4 py-4 text-sm tabular-nums text-muted">{formatCurrency(product.selling_price)}</td>
                  <td className="px-4 py-4 text-sm tabular-nums font-semibold text-primary">{computedMargin.toFixed(1)}%</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Button
                        aria-label={`Edit ${product.name}`}
                        className="h-10 rounded-full border-border bg-slate-50 px-3 text-slate-700 hover:bg-slate-100"
                        onClick={() => openEditModal(product)}
                        variant="subtle"
                      >
                        <Pencil className="h-[18px] w-[18px] shrink-0" stroke="#334155" strokeWidth={2.2} />
                        <span>Edit</span>
                      </Button>
                      <Button
                        aria-label={`Delete ${product.name}`}
                        className="h-10 rounded-full border-red-200 bg-red-50 px-3 text-danger hover:bg-red-100"
                        onClick={() => handleDelete(product)}
                        variant="ghost"
                      >
                        <Trash2 className="h-[18px] w-[18px] shrink-0" stroke="#EF4444" strokeWidth={2.2} />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      ) : (
        <div className="panel-card flex flex-col items-center justify-center rounded-[28px] px-6 py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-primary">
            <Plus className="h-8 w-8" />
          </div>
          <h3 className="mt-6 font-display text-2xl font-semibold text-text">Add your first product</h3>
          <p className="mt-3 max-w-md text-base text-muted">
            Start your inventory list with clear SKUs, pricing, and stock levels.
          </p>
          <Button className="mt-6" onClick={openAddModal}>
            Add Product
          </Button>
        </div>
      )}

      <Modal
        onClose={closeModal}
        open={modalOpen}
        subtitle={editingProduct ? "Update product details and save changes." : "Create a new inventory item for your store."}
        title={editingProduct ? "Edit Product" : "Add Product"}
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              error={errors.name}
              label="Name*"
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              value={form.name}
            />
            <Select
              error={errors.category}
              label="Category*"
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              value={form.category}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Input
              error={errors.barcode}
              label="Barcode / QR Value"
              onChange={(event) => setForm((current) => ({ ...current, barcode: event.target.value }))}
              value={form.barcode}
            />
            <Input
              error={errors.sku}
              label="SKU*"
              onChange={(event) => {
                setSkuTouched(true);
                setForm((current) => ({ ...current, sku: event.target.value }));
              }}
              value={form.sku}
            />
            <Input
              error={errors.stock}
              label="Initial Stock*"
              min="0"
              onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
              type="number"
              value={form.stock}
            />
            <Input
              error={errors.cost_price}
              label="Cost Price (₦)*"
              min="0"
              onChange={(event) => setForm((current) => ({ ...current, cost_price: event.target.value }))}
              type="number"
              value={form.cost_price}
            />
            <Input
              error={errors.selling_price}
              label="Selling Price (₦)*"
              min="0"
              onChange={(event) => setForm((current) => ({ ...current, selling_price: event.target.value }))}
              type="number"
              value={form.selling_price}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <BarcodePreview value={form.barcode.trim() || form.sku.trim() || "TRACKIT"} />
            <QrPreview value={form.barcode.trim() || form.sku.trim() || "TRACKIT"} />
          </div>
          <div className="rounded-2xl border border-primary/15 bg-primary-light/50 px-4 py-3 text-sm text-primary">
            Live margin: <span className="font-semibold">{margin}%</span>
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button onClick={closeModal} variant="ghost">
              Cancel
            </Button>
            <Button type="submit">{editingProduct ? "Save Changes" : "Add Product"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
