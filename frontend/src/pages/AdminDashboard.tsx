import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { AdminUser, Order, OrderStatus, Product } from "@/lib/types";

const statuses: OrderStatus[] = ["Pending", "Confirmed", "Processing", "Ready for Dispatch", "Dispatched", "Delivered", "Cancelled"];
const blank = { brand: "11 CR", name: "", sku: "", category: "jeans", sizes: "28, 30, 32, 34, 36", colors: "Dark Indigo, Black", fabric: "Cotton denim", price: "", moq: "30", stock: "", images: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=85", description: "", availability_status: "In stock" };
const newProductFields = [
  ["brand", "Brand name"], ["name", "Product name"], ["sku", "SKU"], ["price", "Wholesale price"],
  ["moq", "MOQ"], ["stock", "Stock"], ["sizes", "Sizes (comma separated)"], ["colors", "Colors (comma separated)"],
  ["fabric", "Fabric"], ["images", "Image URL"], ["description", "Description"], ["availability_status", "Availability"],
] as const;

export default function AdminDashboard() {
  const client = useQueryClient();
  const [form, setForm] = useState(blank);
  const [search, setSearch] = useState("");
  const me = useQuery({ queryKey: ["admin-me"], queryFn: () => apiGet<AdminUser>("/admin/me"), retry: false });
  const products = useQuery({ queryKey: ["admin-products"], queryFn: () => apiGet<Product[]>("/products"), enabled: me.isSuccess });
  const orders = useQuery({ queryKey: ["admin-orders", search], queryFn: () => apiGet<Order[]>(`/admin/orders${search ? `?search=${encodeURIComponent(search)}` : ""}`), enabled: me.isSuccess });
  const create = useMutation({ mutationFn: () => apiPost<Product>("/products", { ...form, sizes: form.sizes.split(",").map((item) => item.trim()), colors: form.colors.split(",").map((item) => item.trim()), price: Number(form.price), moq: Number(form.moq), stock: Number(form.stock), images: [form.images], featured: false }), onSuccess: () => { setForm(blank); client.invalidateQueries({ queryKey: ["admin-products"] }); } });
  const remove = useMutation({ mutationFn: (id: string) => apiDelete<void>(`/products/${id}`), onSuccess: () => client.invalidateQueries({ queryKey: ["admin-products"] }) });
  const updateProduct = useMutation({ mutationFn: ({ id, values }: { id: string; values: Partial<Product> }) => apiPut<Product>(`/products/${id}`, values), onSuccess: () => client.invalidateQueries({ queryKey: ["admin-products"] }) });
  const updateOrder = useMutation({ mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => apiPatch<Order>(`/admin/orders/${id}/status`, { status }), onSuccess: () => client.invalidateQueries({ queryKey: ["admin-orders"] }) });

  if (!me.isSuccess) return <div className="container section" data-testid="admin-dashboard-locked"><p className="eyebrow">11 CR / OWNER ACCESS</p><h1 className="page-title">Admin session <span>required.</span></h1><p className="mt-4 text-slate-400">Please sign in to manage the Kapda Godam desk.</p><a href="/admin" className="text-link mt-7">Go to admin login</a></div>;

  return <div className="container section admin-page" data-testid="admin-dashboard-page">
    <div className="admin-header"><div><p className="eyebrow">11 CR / KAPDA GODAM OWNER DESK</p><h1 className="page-title">Brand <span>control.</span></h1><p className="mt-4 text-sm text-slate-400">Manage 11 CR identity, wholesale product details and buyer orders from one place.</p></div><Badge data-testid="admin-session-badge">Authenticated</Badge></div>
    <section className="admin-stats"><Stat label="Active 11 CR lots" value={String(products.data?.length ?? 0)} testId="active-products" /><Stat label="Incoming orders" value={String(orders.data?.length ?? 0)} testId="incoming-orders" /><Stat label="Pending confirmation" value={String(orders.data?.filter((order) => order.status === "Pending").length ?? 0)} testId="pending-orders" /></section>
    <section className="admin-section" data-testid="admin-add-product-section"><div className="admin-section-heading"><div><p className="eyebrow">11 CR CATALOG CONTROL</p><h2>Add a product lot</h2></div></div><div className="admin-form-grid">{newProductFields.map(([name, label]) => <label key={name}>{label}<Input value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} data-testid={`admin-product-${name}-input`} /></label>)}<label>Category<select className="filter-select" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} data-testid="admin-product-category-select"><option value="jeans">Men's Jeans</option><option value="shirts">Men's Shirts</option></select></label></div><Button onClick={() => create.mutate()} disabled={create.isPending || !form.brand || !form.name || !form.sku || !form.price || !form.stock} className="mt-5" data-testid="admin-create-product-button">Add branded product lot</Button></section>
    <section className="admin-section" data-testid="admin-products-section"><div className="admin-section-heading"><div><p className="eyebrow">PRODUCT LOTS</p><h2>Edit full product details</h2></div></div><div className="admin-table">{products.data?.map((product) => <AdminProductEditor key={product.id} product={product} onDelete={() => remove.mutate(product.id)} onSave={(values) => updateProduct.mutate({ id: product.id, values })} />)}</div></section>
    <section className="admin-section" data-testid="admin-orders-section"><div className="admin-section-heading"><div><p className="eyebrow">KAPDA GODAM WHOLESALE ORDERS</p><h2>Incoming briefs</h2></div><Input placeholder="Search order or business" value={search} onChange={(event) => setSearch(event.target.value)} className="max-w-xs" data-testid="admin-order-search-input" /></div>{orders.data?.length ? <div className="admin-orders">{orders.data.map((order) => <div className="admin-order" key={order.id} data-testid={`admin-order-${order.order_id.toLowerCase()}`}><div><p className="sku">{order.order_id}</p><h3>{order.business_name}</h3><p className="text-sm text-slate-400">{order.customer_name} · {order.items.reduce((sum, item) => sum + item.quantity, 0)} pcs · ₹{order.total_estimate.toLocaleString("en-IN")}</p></div><select className="filter-select" value={order.status} onChange={(event) => updateOrder.mutate({ id: order.order_id, status: event.target.value as OrderStatus })} data-testid={`admin-order-status-${order.order_id.toLowerCase()}`}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div>)}</div> : <div className="empty-state small" data-testid="admin-orders-empty">No wholesale orders yet. Incoming briefs will appear here.</div>}</section>
  </div>;
}

function Stat({ label, value, testId }: { label: string; value: string; testId: string }) { return <div className="admin-stat" data-testid={`admin-stat-${testId}`}><strong>{value}</strong><span>{label}</span></div>; }

function AdminProductEditor({ product, onDelete, onSave }: { product: Product; onDelete: () => void; onSave: (values: Partial<Product>) => void }) {
  const [draft, setDraft] = useState({ brand: product.brand, name: product.name, sku: product.sku, category: product.category, price: String(product.price), moq: String(product.moq), sizes: product.sizes.join(", "), colors: product.colors.join(", "), fabric: product.fabric, stock: String(product.stock), images: product.images.join(", "), description: product.description, availability_status: product.availability_status });
  const save = () => onSave({ brand: draft.brand, name: draft.name, sku: draft.sku, category: draft.category as Product["category"], price: Number(draft.price), moq: Number(draft.moq), sizes: draft.sizes.split(",").map((item) => item.trim()), colors: draft.colors.split(",").map((item) => item.trim()), fabric: draft.fabric, stock: Number(draft.stock), images: draft.images.split(",").map((item) => item.trim()), description: draft.description, availability_status: draft.availability_status });
  return <div className="admin-product-editor" data-testid={`admin-product-row-${product.sku.toLowerCase()}`}>
    <div className="admin-product-editor-head"><div className="flex min-w-0 items-center gap-4"><img src={product.images[0]} alt={product.name} /><div><p className="sku">BRAND: {product.brand} · {product.sku}</p><h3>{product.name}</h3></div></div><Button size="sm" variant="ghost" onClick={onDelete} data-testid={`admin-delete-${product.sku.toLowerCase()}`}>Delete</Button></div>
    <div className="admin-edit-grid">
      <EditField label="Brand name" value={draft.brand} onChange={(value) => setDraft({ ...draft, brand: value })} testId={`admin-edit-brand-${product.sku.toLowerCase()}`} />
      <EditField label="Product name" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} testId={`admin-edit-name-${product.sku.toLowerCase()}`} />
      <EditField label="SKU" value={draft.sku} onChange={(value) => setDraft({ ...draft, sku: value })} testId={`admin-edit-sku-${product.sku.toLowerCase()}`} />
      <label>Category<select className="filter-select" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as Product["category"] })} data-testid={`admin-edit-category-${product.sku.toLowerCase()}`}><option value="jeans">Men's Jeans</option><option value="shirts">Men's Shirts</option></select></label>
      <EditField label="Price" value={draft.price} onChange={(value) => setDraft({ ...draft, price: value })} testId={`admin-edit-price-${product.sku.toLowerCase()}`} />
      <EditField label="MOQ" value={draft.moq} onChange={(value) => setDraft({ ...draft, moq: value })} testId={`admin-edit-moq-${product.sku.toLowerCase()}`} />
      <EditField label="Stock" value={draft.stock} onChange={(value) => setDraft({ ...draft, stock: value })} testId={`admin-edit-stock-${product.sku.toLowerCase()}`} />
      <EditField label="Sizes" value={draft.sizes} onChange={(value) => setDraft({ ...draft, sizes: value })} testId={`admin-edit-sizes-${product.sku.toLowerCase()}`} />
      <EditField label="Colors" value={draft.colors} onChange={(value) => setDraft({ ...draft, colors: value })} testId={`admin-edit-colors-${product.sku.toLowerCase()}`} />
      <EditField label="Fabric" value={draft.fabric} onChange={(value) => setDraft({ ...draft, fabric: value })} testId={`admin-edit-fabric-${product.sku.toLowerCase()}`} />
      <EditField label="Image URLs" value={draft.images} onChange={(value) => setDraft({ ...draft, images: value })} testId={`admin-edit-images-${product.sku.toLowerCase()}`} />
      <EditField label="Availability" value={draft.availability_status} onChange={(value) => setDraft({ ...draft, availability_status: value })} testId={`admin-edit-availability-${product.sku.toLowerCase()}`} />
      <EditField label="Description" value={draft.description} onChange={(value) => setDraft({ ...draft, description: value })} testId={`admin-edit-description-${product.sku.toLowerCase()}`} wide />
    </div>
    <Button size="sm" onClick={save} data-testid={`admin-save-${product.sku.toLowerCase()}`}>Save all product changes</Button>
  </div>;
}

function EditField({ label, value, onChange, testId, wide = false }: { label: string; value: string; onChange: (value: string) => void; testId: string; wide?: boolean }) { return <label className={wide ? "admin-edit-wide" : ""}>{label}<Input value={value} onChange={(event) => onChange(event.target.value)} data-testid={testId} /></label>; }