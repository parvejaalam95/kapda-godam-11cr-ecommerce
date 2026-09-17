import { Link, NavLink, Outlet } from "react-router-dom";
import { ArrowUpRight, Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";

const navItems = [["Jeans", "/jeans"], ["Shirts", "/shirts"], ["Wholesale", "/wholesale"], ["About Us", "/about"], ["Contact", "/contact"]];

export default function Layout() {
  const { totalPieces } = useCart();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-ink text-white">
      <div className="top-strip" data-testid="wholesale-only-banner">WHOLESALE ONLY <span>•</span> MOQ APPLIES ON EVERY ORDER <span>•</span> DIRECT FROM ULHASNAGAR 5</div>
      <header className="site-header">
        <div className="container flex h-[74px] items-center justify-between gap-6">
          <Link to="/" className="brand-mark" data-testid="site-logo-link"><span className="brand-k">KG</span><span><strong>Kapda Godam</strong><small>Bulk clothing hub</small></span></Link>
          <nav className="hidden items-center gap-7 lg:flex" data-testid="desktop-navigation">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
            {navItems.map(([label, path]) => <NavLink key={path} to={path} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{label}</NavLink>)}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/cart" className="cart-link" data-testid="header-cart-link"><ShoppingBag size={17} /><span>Cart</span><b data-testid="header-cart-count">{totalPieces}</b></Link>
            <Link to="/admin" className="admin-link" data-testid="header-admin-link">Admin <ArrowUpRight size={14} /></Link>
            <button className="mobile-menu-button lg:hidden" onClick={() => setOpen(!open)} data-testid="mobile-menu-toggle" aria-label="Open menu">{open ? <X /> : <Menu />}</button>
          </div>
        </div>
        {open && <nav className="mobile-nav lg:hidden" data-testid="mobile-navigation">{[["Home", "/"], ...navItems, ["Cart", "/cart"], ["Admin Login", "/admin"]].map(([label, path]) => <Link key={path} to={path} onClick={() => setOpen(false)} data-testid={`mobile-nav-${label.toLowerCase().replaceAll(" ", "-")}`}>{label}</Link>)}</nav>}
      </header>
      <main><Outlet /></main>
      <footer className="site-footer" data-testid="site-footer">
        <div className="container grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr]">
          <div><div className="brand-mark mb-5"><span className="brand-k">KG</span><span><strong>Kapda Godam</strong><small>Wholesale clothing hub</small></span></div><p className="max-w-sm text-sm leading-7 text-slate-400">A dependable wholesale source for Men's Jeans and Shirts, supplying retail stores and resellers from Ulhasnagar 5.</p></div>
          <div><p className="footer-label">Navigate</p><div className="footer-links">{navItems.slice(0, 4).map(([label, path]) => <Link key={path} to={path} data-testid={`footer-${label.toLowerCase().replaceAll(" ", "-")}-link`}>{label}</Link>)}</div></div>
          <div><p className="footer-label">Direct desk</p><p className="text-sm leading-7 text-slate-400" data-testid="footer-contact-info">+91 XXXXX XXXXX<br />WhatsApp: +91 XXXXX XXXXX<br />hello@kapdagodam.in<br />Ulhasnagar 5, Maharashtra</p></div>
        </div>
        <div className="container border-t border-white/10 py-5 text-xs uppercase tracking-[0.18em] text-slate-500">© 2025 Kapda Godam · Shamsuddin Idrisi & Tabrez Idrisi</div>
      </footer>
    </div>
  );
}
