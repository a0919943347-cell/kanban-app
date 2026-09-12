-- ============================================================
-- 資料庫結構定義 (Schema) - 電商 / 會員購買系統
-- ============================================================

-- 開啟外鍵約束支援 (SQLite 預設未開啟，需在連線時執行)
PRAGMA foreign_keys = ON;

-- 1. 會員資料表 (users)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,      -- 會員唯一識別碼 (主鍵，自動遞增)
    email TEXT NOT NULL UNIQUE,                -- 會員電子信箱 (必填、唯一值，用於登入與通知)
    name TEXT NOT NULL,                        -- 會員姓名 (必填)
    phone TEXT,                                -- 會員聯絡電話 (選填，格式如 0912-345-678)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 帳號註冊時間 (預設當前 UTC 時間)
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- 資料最後更新時間
);

-- 2. 商品資料表 (products)
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,      -- 商品唯一識別碼 (主鍵，自動遞增)
    product_name TEXT NOT NULL,                -- 商品名稱 (必填)
    price REAL NOT NULL CHECK(price >= 0),     -- 商品當前售價 (必填，不可為負數)
    description TEXT,                          -- 商品描述 (選填)
    stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0), -- 商品庫存數量 (預設 0，不可為負數)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 商品建立時間
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- 商品資料更新時間
);

-- 3. 會員購買紀錄關聯表 (user_products)
CREATE TABLE IF NOT EXISTS user_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,      -- 購買明細唯一識別碼 (主鍵)
    user_id INTEGER NOT NULL,                  -- 購買會員 ID (外鍵，關聯至 users.id)
    product_id INTEGER NOT NULL,               -- 購買商品 ID (外鍵，關聯至 products.id)
    quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity > 0), -- 購買數量 (至少為 1)
    purchase_price REAL NOT NULL CHECK(purchase_price >= 0),  -- 購買當下單價 (歷史快照價格)
    status TEXT NOT NULL DEFAULT 'completed' CHECK(status IN ('pending', 'completed', 'cancelled', 'refunded')), -- 訂單/購買狀態
    purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,         -- 購買時間 (預設當前 UTC 時間)
    
    -- 外鍵約束 (確保關聯完整性)
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- 索引優化 (提升依會員或依商品查詢購買紀錄時的查詢速度)
CREATE INDEX IF NOT EXISTS idx_user_products_user_id ON user_products(user_id);
CREATE INDEX IF NOT EXISTS idx_user_products_product_id ON user_products(product_id);

-- 建立單數名稱 View (支援 user, product, user_product 查詢)
CREATE VIEW IF NOT EXISTS user AS SELECT * FROM users;
CREATE VIEW IF NOT EXISTS product AS SELECT * FROM products;
CREATE VIEW IF NOT EXISTS user_product AS SELECT * FROM user_products;
