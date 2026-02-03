import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function ProductsPage() {
  const size = 10;

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  // 상품 수정 button event
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    productId: null,
    name: "",
    price: 0,
    stock: 0,
  });

  // 삭제 상품 조회
  const [deletedOpen, setDeletedOpen] = useState(false);
  const [deletedProducts, setDeletedProducts] = useState([]);

  // 상품 추가
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", price: 0, stock: 0 });

  // 페이징 처리
  const [totalPages, setTotalPages] = useState(0);

  // ----

  const load = async (p = page) => {
    const res = await api.get("/products", { params: { page: p, size } });

    setProducts(res.data.content ?? []);
    setTotalPages(res.data.totalPages ?? 0);
    setPage(res.data.number ?? p);
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const remove = async (productId) => {
    if (!confirm("상품을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/products/${productId}`);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message ?? "delete failed");
    }
  };

  // 상품 조회 및 수정 - 모달 열기, 닫기 함수
  const openEdit = (p) => {
    setEditForm({
      productId: p.productId,
      name: p.name,
      price: p.price,
      stock: p.stock,
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditForm({ productId: null, name: "", price: 0, stock: 0 });
  };

  // 입력 변경 핸들러
  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Number(value),
    }));
  };

  //수정 API 호출 (PATCH)
  const updateProduct = async () => {
    if (!editForm.productId) return;
    if (!editForm.name.trim()) return alert("name required");
    if (editForm.price < 0 || editForm.stock < 0)
      return alert("price/stock must be >= 0");

    try {
      await api.patch(`/products/${editForm.productId}`, {
        name: editForm.name,
        price: editForm.price,
        stock: editForm.stock,
      });

      alert("수정 완료되었습니다");
      await load(); // 목록 새로고침
      closeEdit(); // 모달 닫기
    } catch (e) {
      alert(e?.response?.data?.message ?? "update failed");
    }
  };

  // 삭제 상품 조회 모달
  const openDeletedModal = async () => {
    try {
      const res = await api.get("/products/deleted");
      setDeletedProducts(res.data);
      setDeletedOpen(true);
    } catch (e) {
      alert(e?.response?.data?.message ?? "deleted products load failed");
    }
  };

  const closeDeletedModal = () => {
    setDeletedOpen(false);
    setDeletedProducts([]);
  };

  const restoreProduct = async (productId) => {
    try {
      await api.post(`/products/${productId}/restore`);
      alert("복구 완료되었습니다");

      // 모달 데이터 갱신 + 메인 목록도 갱신
      const res = await api.get("/products/deleted");
      setDeletedProducts(res.data);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message ?? "restore failed");
    }
  };

  // 상품 추가 모달
  const openAddModal = () => {
    setAddForm({ name: "", price: 0, stock: 0 });
    setAddOpen(true);
  };

  const closeAddModal = () => {
    setAddOpen(false);
  };

  const onAddChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [name]: name === "name" ? value : Number(value),
    }));
  };

  const createFromModal = async () => {
    if (!addForm.name.trim()) return alert("name required");
    if (addForm.price < 0 || addForm.stock < 0)
      return alert("price/stock must be >= 0");

    setLoading(true);
    try {
      await api.post("/products", addForm);
      alert("상품이 추가되었습니다");
      await load();
      closeAddModal();
    } catch (e) {
      alert(e?.response?.data?.message ?? "create failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>상품 Products</h3>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button type="button" onClick={openDeletedModal}>
          삭제된 상품 조회
        </button>

        <button type="button" onClick={openAddModal}>
          상품 추가
        </button>
      </div>

      <br />

      <table border="1" cellPadding="6" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>상품 ID</th>
            <th>상품명</th>
            <th>가격</th>
            <th>재고</th>
            <th>삭제여부</th>
            <th>삭제</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.productId}>
              <td>{p.productId}</td>
              <td>
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "blue",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  {p.name}
                </button>
              </td>
              <td>{p.price}</td>
              <td
                style={{
                  backgroundColor: p.stock === 0 ? "#87CEFA" : "transparent",
                }}
              >
                {p.stock}
                {p.stock === 0 && (
                  <span style={{ marginLeft: 6, fontSize: 12 }}>(재고없음)</span>
                )}
              </td>
              <td>{String(p.deleted)}</td>
              <td>
                <button onClick={() => remove(p.productId)}>Delete</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                empty
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 페이징 버튼 */}
      <div style={{ marginTop: 12, display: "flex", gap: 6, alignItems: "center" }}>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button key={i} onClick={() => setPage(i)}>{i + 1}</button>
        ))}
        <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
        <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.7 }}>
          {page + 1} / {totalPages}
        </span>
      </div>

      {/* 상품 수정 모달 */}
      {editOpen && (
        <div
          onClick={closeEdit}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 360,
              background: "white",
              borderRadius: 8,
              padding: 16,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            <h4 style={{ marginTop: 0 }}>상품 수정</h4>

            <div style={{ display: "grid", gap: 8 }}>
              <label>
                이름:
                <input
                  name="name"
                  value={editForm.name}
                  onChange={onEditChange}
                  style={{ width: "100%" }}
                />
              </label>

              <label>
                가격:
                <input
                  name="price"
                  type="number"
                  value={editForm.price}
                  onChange={onEditChange}
                  style={{ width: "100%" }}
                />
              </label>

              <label>
                재고:
                <input
                  name="stock"
                  type="number"
                  value={editForm.stock}
                  onChange={onEditChange}
                  style={{ width: "100%" }}
                />
              </label>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                justifyContent: "flex-end",
              }}
            >
              <button onClick={closeEdit}>취소</button>
              <button onClick={updateProduct}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제된 상품 조회 모달 */}
      {deletedOpen && (
        <div
          onClick={closeDeletedModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 700,
              background: "white",
              borderRadius: 8,
              padding: 16,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h4 style={{ margin: 0 }}>삭제된 상품 목록</h4>
              <button onClick={closeDeletedModal}>X</button>
            </div>

            <table
              border="1"
              cellPadding="6"
              style={{
                borderCollapse: "collapse",
                marginTop: 12,
                width: "100%",
              }}
            >
              <thead>
                <tr>
                  <th>ID</th>
                  <th>상품명</th>
                  <th>가격</th>
                  <th>재고</th>
                  <th>삭제여부</th>
                  <th>복구</th>
                </tr>
              </thead>
              <tbody>
                {deletedProducts.map((p) => (
                  <tr key={p.productId}>
                    <td>{p.productId}</td>
                    <td>{p.name}</td>
                    <td>{p.price}</td>
                    <td>{p.stock}</td>
                    <td>{String(p.deleted)}</td>
                    <td>
                      <button onClick={() => restoreProduct(p.productId)}>
                        복구
                      </button>
                    </td>
                  </tr>
                ))}

                {deletedProducts.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      삭제된 상품이 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 상품 추가 모달 */}
      {addOpen && (
        <div
          onClick={closeAddModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 360,
              background: "white",
              borderRadius: 8,
              padding: 16,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            <h4 style={{ marginTop: 0 }}>상품 추가</h4>

            <div style={{ display: "grid", gap: 8 }}>
              <label>
                이름:
                <input
                  name="name"
                  value={addForm.name}
                  onChange={onAddChange}
                  style={{ width: "100%" }}
                />
              </label>

              <label>
                가격:
                <input
                  name="price"
                  type="number"
                  value={addForm.price}
                  onChange={onAddChange}
                  style={{ width: "100%" }}
                />
              </label>

              <label>
                재고:
                <input
                  name="stock"
                  type="number"
                  value={addForm.stock}
                  onChange={onAddChange}
                  style={{ width: "100%" }}
                />
              </label>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                justifyContent: "flex-end",
              }}
            >
              <button onClick={closeAddModal}>취소</button>
              <button onClick={createFromModal} disabled={loading}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
