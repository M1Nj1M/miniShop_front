import { Link, Route, Routes } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import OrderProductPage from "./pages/OrderProductPage";

export default function App() {
  return (
    <div
      style={{
        padding: 20,
        fontFamily: "sans-serif",
        width: 900,
        margin: "0 auto",
      }}
    >
      <h2>MiniShop</h2>

      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/">상품 관리</Link>
        <Link to="/orders">주문 관리</Link>
        <Link to="/order-product">상품 주문</Link>
      </nav>

      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/order-product" element={<OrderProductPage />} />
      </Routes>
    </div>
  );
}
