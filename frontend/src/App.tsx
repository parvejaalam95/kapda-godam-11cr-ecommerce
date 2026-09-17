import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/lib/cart";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import WholesaleOrder from "@/pages/WholesaleOrder";
import Confirmation from "@/pages/Confirmation";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

// One <Route> per page in src/pages; BrowserRouter already wraps this in main.tsx.
export default function App() {
  return <CartProvider><Routes><Route element={<Layout />}><Route path="/" element={<Home />} /><Route path="/jeans" element={<Catalog category="jeans" />} /><Route path="/shirts" element={<Catalog category="shirts" />} /><Route path="/product/:id" element={<ProductDetail />} /><Route path="/cart" element={<Cart />} /><Route path="/wholesale" element={<WholesaleOrder />} /><Route path="/confirmation/:orderId" element={<Confirmation />} /><Route path="/about" element={<About />} /><Route path="/contact" element={<Contact />} /></Route><Route path="/admin" element={<AdminLogin />} /><Route path="/admin/dashboard" element={<AdminDashboard />} /></Routes><Toaster richColors /></CartProvider>;
}
