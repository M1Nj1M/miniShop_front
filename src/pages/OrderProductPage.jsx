import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

export default function OrderProductPage() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null); // 선택된 상품 객체
  const quantity = 1;
  const [loading, setLoading] = useState(false);

  // 프론트 페이징 상태
  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);

  const loadProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data);
  };

  useEffect(() => {
    (async () => {
      await loadProducts();
    })();
  }, []);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));

  // page 바뀔 때 범위 밖이면 보정
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pagedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [products, page]);

  const orderOne = async () => {
    if (!selected) return alert("상품을 선택해주세요");
    if (selected.stock < 1) return alert("재고가 부족합니다");

    setLoading(true);
    try {
      await api.post("/orders", {
        productId: selected.productId,
        quantity: Number(quantity),
      });

      alert("주문이 완료되었습니다");

      // 재고 반영 위해 reload
      await loadProducts();

      // reload 후 선택 상품도 최신으로 갱신
      setSelected((prev) => {
        if (!prev) return null;
        const fresh = products.find((p) => p.productId === prev.productId);
        return fresh ?? prev;
      });
    } catch (e) {
      alert(e?.response?.data?.message ?? "order failed");
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (p) => selected?.productId === p.productId;

  return (
    <div>
      <h3>상품 주문</h3>

      {/* 선택 정보 + 주문 영역 */}
      <div
        style={{
          border: "1px solid #ddd",
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div>
            선택 상품:{" "}
            <b>{selected ? selected.name : "없음 (아래에서 클릭해서 선택)"}</b>
          </div>
          {selected && (
            <div style={{ marginTop: 4 }}>
              가격: {selected.price}원 / 재고: {selected.stock}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ fontWeight: 600 }}>수량: 1개</div>

          <button
            style={{
              backgroundColor: loading || !selected ? "#bcdcff" : "#87CEFA",
            }}
            onClick={orderOne}
            disabled={loading || !selected}
          >
            주문하기
          </button>
        </div>
      </div>

      {/* 상품 카드 그리드 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)", // ✅ 1열에 4개
          gap: 12,
        }}
      >
        {pagedProducts.map((p) => (
          <button
            key={p.productId}
            type="button"
            onClick={() => setSelected(p)}
            disabled={p.stock === 0}
            style={{
              aspectRatio: "1 / 1", // ✅ 정사각형
              border: "2px solid black", // ✅ 검정 테두리
              background: isSelected(p) ? "#f0f0f0" : "white",
              cursor: p.stock === 0 ? "not-allowed" : "pointer",
              opacity: p.stock === 0 ? 0.5 : 1,
              padding: 12,
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            title={p.stock === 0 ? "품절" : "클릭해서 선택"}
          >
            <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div>

            <div style={{ fontSize: 14 }}>
              <div>가격: {p.price}원</div>
              <div>재고: {p.stock}</div>
              {p.stock === 0 && <div style={{ marginTop: 6 }}>품절</div>}
            </div>
          </button>
        ))}
      </div>

      {/* 페이징 */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button onClick={() => setPage(1)} disabled={page === 1}>
          {"<<"}
        </button>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          {"<"}
        </button>

        <span>
          {page} / {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          {">"}
        </button>
        <button
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
        >
          {">>"}
        </button>
      </div>
    </div>
  );
}
