import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function OrdersPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  // 상품 이름 호출
  const productNameById = new Map(products.map((p) => [p.productId, p.name]));

  const loadProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data);
  };

  const loadOrders = async () => {
    const res = await api.get("/orders");
    setOrders(res.data);
  };

  const loadAll = async () => {
    await Promise.all([loadProducts(), loadOrders()]);
  };

  // 주문 상태 -> 한국어 표시
  const ORDER_STATUS_KR = {
    CREATED: "주문 완료",
    CANCELED: "주문 취소",
  };

  // 주문 날짜 포맷
  const formatKoreanDateTime = (isoString) => {
    if (!isoString) return "";

    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;

    const pad2 = (n) => String(n).padStart(2, "0");

    const y = d.getFullYear();
    const m = pad2(d.getMonth() + 1);
    const day = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mm = pad2(d.getMinutes());

    return `${y}년 ${m}월 ${day}일 ${hh}시 ${mm}분`;
  };

  useEffect(() => {
    (async () => {
      await loadAll();
    })();
  }, []);

  const cancel = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/cancel`);
      await loadAll();
    } catch (e) {
      alert(e?.response?.data?.message ?? "cancel failed");
    }
  };

  return (
    <div>
      <h3>주문 Orders</h3>

      <table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>주문 ID</th>
            <th>상품명</th>
            <th>재고</th>
            <th>상태</th>
            <th>주문날짜</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.orderId}>
              <td>{o.orderId}</td>
              <td>
                {productNameById.get(o.productId) ?? `상품#${o.productId}`}
              </td>
              <td>{o.quantity}</td>
              <td>{ORDER_STATUS_KR[o.status] ?? o.status}</td>
              <td>{formatKoreanDateTime(o.createdAt)}</td>
              <td>
                {o.status !== "CANCELED" ? (
                  <button onClick={() => cancel(o.orderId)}>주문취소</button>
                ) : (
                  "취소완료"
                )}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                empty
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
