import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export default function Catalog({ category }: { category: "jeans" | "shirts" }) {
  const [search, setSearch] = useState("");
  const [size, setSize] = useState("all");
  const [color, setColor] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const query = new URLSearchParams({ category });
  if (search) query.set("search", search);
  if (size !== "all") query.set("size", size);
  if (color !== "all") query.set("color", color);
  if (maxPrice) query.set("max_price", maxPrice);
  const { data = [], isError, isLoading } = useQuery({ queryKey: ["products", category, search, size, color, maxPrice], queryFn: () => apiGet<Product[]>(`/products?${query.toString()}`), retry: false });
  const sizes = useMemo(() => [...new Set(data.flatMap((product) => product.sizes))], [data]);
  const colors = useMemo(() => [...new Set(data.flatMap((product) => product.colors))], [data]);
  const title = category === "jeans" ? "Denim" : "Shirting";
  return <div className="catalog-page container section" data-testid={`${category}-catalog-page`}><div className="catalog-header"><div><p className="eyebrow">11 CR / WHOLESALE CATALOG / 0{category === "jeans" ? "1" : "2"}</p><h1 className="page-title">Men's <span>{title}</span></h1><p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">Commercially ready 11 CR {category} lots from Kapda Godam, with clear SKUs, quantities and minimums. Every price shown is wholesale per piece.</p></div><div className="catalog-count" data-testid={`${category}-catalog-count`}><strong>{data.length}</strong><span>active lots</span></div></div><div className="filter-panel" data-testid={`${category}-filters`}><div className="search-field"><Search size={17} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or SKU" data-testid={`${category}-search-input`} /></div><select value={size} onChange={(event) => setSize(event.target.value)} className="filter-select" data-testid={`${category}-size-filter`}><option value="all">All sizes</option>{sizes.map((item) => <option key={item}>{item}</option>)}</select><select value={color} onChange={(event) => setColor(event.target.value)} className="filter-select" data-testid={`${category}-color-filter`}><option value="all">All colors</option>{colors.map((item) => <option key={item}>{item}</option>)}</select><Input type="number" min="0" placeholder="Max ₹ / pc" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className="price-filter" data-testid={`${category}-price-filter`} /><Button variant="ghost" onClick={() => { setSearch(""); setSize("all"); setColor("all"); setMaxPrice(""); }} data-testid={`${category}-clear-filters-button`}><X size={15} /> Clear</Button></div><div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-slate-500"><SlidersHorizontal size={14} /> {isLoading ? "Loading current lots…" : isError ? "Catalog unavailable — showing the buying shell" : `${data.length} lots match your buying brief`}</div><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{data.map((product) => <ProductCard key={product.id} product={product} />)}</div>{!isLoading && !isError && data.length === 0 && <div className="empty-state" data-testid={`${category}-empty-state`}>No lots match those filters. Try clearing your buying brief.</div>}</div>;
}
