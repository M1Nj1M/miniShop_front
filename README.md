# MiniShop (Frontend)

상품 관리(CRUD), 주문 관리(조회/취소), 상품 주문 기능을 제공하는 React(Vite) 기반 프로젝트

간단한 CRUD 복습

---

## 1. MiniShop 백엔드 레포지토리

- Backend(Spring Boot): https://github.com/M1Nj1M/miniShop

---

## 2. 프론트엔드 프로젝트 구조

```text
minishop-front
├─ public
├─ src
│  ├─ api
│  │  └─ client.js
│  │
│  ├─ pages
│  │  ├─ ProductsPage.jsx        # 상품 관리(CRUD + 모달)
│  │  ├─ OrdersPage.jsx          # 주문 관리(조회/취소)
│  │  └─ OrderProductPage.jsx    # 상품 주문(카드형 UI + 페이징)
│  │
│  ├─ App.jsx                    # 라우팅 및 네비게이션
│  └─ main.jsx                   # React 엔트리
│
├─ vite.config.js                # 개발 프록시 설정(/api → backend)
├─ package.json
└─ README.md
```
