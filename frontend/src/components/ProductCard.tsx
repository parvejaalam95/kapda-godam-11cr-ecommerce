import { Link } from "react-router-dom";
import { ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

export default function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addItem } = useCart();
  return <article className={`product-card ${compact ? "product-card-compact" : ""}`} data-testid={`product-card-${product.sku.toLowerCase()}`}>
    <Link to={`/product/${product.id}`} className="product-image-wrap" data-testid={`product-image-link-${product.sku.toLowerCase()}`}><img src={product.images[0]} alt={product.name} className="product-image" /><span className="image-category">{product.category === "jeans" ? "DENIM" : "SHIRTING"}</span><span className="product-brand-chip" data-testid={`product-brand-${product.sku.toLowerCase()}`}>{product.brand}</span></Link>
    <div className="product-card-body">
      <div className="flex items-start justify-between gap-3"><div><p className="sku" data-testid={`product-sku-${product.sku.toLowerCase()}`}>BRAND: {product.brand} · {product.sku}</p><Link to={`/product/${product.id}`} className="product-name" data-testid={`product-name-link-${product.sku.toLowerCase()}`}>{product.name}</Link></div><ArrowUpRight className="text-amber-400" size={18} /></div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400" data-testid={`product-description-${product.sku.toLowerCase()}`}>{product.description}</p>
      <div className="mt-4 flex flex-wrap gap-2"><Badge variant="outline" data-testid={`product-moq-${product.sku.toLowerCase()}`}>MOQ {product.moq} pcs</Badge><Badge variant="outline" data-testid={`product-stock-${product.sku.toLowerCase()}`}>{product.stock} pcs available</Badge></div>
      {!compact && <div className="mt-5 flex items-end justify-between gap-4"><div><p className="text-[11px] uppercase tracking-widest text-slate-500">Wholesale / pc</p><p className="price">₹{product.price.toLocaleString("en-IN")}</p></div><Button onClick={() => addItem(product)} data-testid={`product-add-to-cart-${product.sku.toLowerCase()}`}><Plus size={16} /> Add MOQ</Button></div>}
    </div>
  </article>;
}
