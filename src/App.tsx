import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "@/components/ui/sonner";

import Index from "@/routes/index";
import About from "@/routes/about";
import Shop from "@/routes/shop";
import ProductDetail from "@/routes/shop.$productId";
import Cart from "@/routes/cart";
import Checkout from "@/routes/checkout";
import Auth from "@/routes/auth";

import AdminGuard from "@/routes/admin";
import AdminLogin from "@/routes/admin.login";
import AdminDashboard from "@/routes/admin.index";
import AdminProducts from "@/routes/admin.products";
import AdminOrders from "@/routes/admin.orders";
import AdminCustomers from "@/routes/admin.customers";
import AdminCategories from "@/routes/admin.categories";
import AdminBanners from "@/routes/admin.banners";
import AdminCoupons from "@/routes/admin.coupons";
import AdminNotifications from "@/routes/admin.notifications";
import AdminReports from "@/routes/admin.reports";
import AdminSettings from "@/routes/admin.settings";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:productId" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/auth" element={<Auth />} />

          {/* Admin: AdminGuard renders <AdminShell/> with <Outlet/> for nested routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminGuard />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster richColors position="top-center" />
      </CartProvider>
    </AuthProvider>
  );
}
