import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'ecommerce.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

console.log(`[1] 正在連接 SQLite 資料庫: ${DB_PATH}...`);
const db = new DatabaseSync(DB_PATH);

// 開啟外鍵約束
db.exec('PRAGMA foreign_keys = ON;');

// 清空並重新依 schema 建表
console.log(`[2] 重建資料表結構...`);
db.exec(`
    DROP VIEW IF EXISTS user_product;
    DROP VIEW IF EXISTS product;
    DROP VIEW IF EXISTS user;
    DROP TABLE IF EXISTS user_products;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS users;
`);
const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schemaSql);

console.log(`[3] 開始批量寫入測試資料 (Seed Data)...`);

// 1. 會員測試資料 (12 位會員)
const users = [
    { email: 'alice.chen@example.com', name: '陳雅婷 (Alice)', phone: '0912-345-678', created_at: '2026-01-10 09:20:00' },
    { email: 'bob.lin@example.com', name: '林志豪 (Bob)', phone: '0923-456-789', created_at: '2026-01-15 14:11:00' },
    { email: 'charlie.wang@example.com', name: '王大衛 (Charlie)', phone: '0934-567-890', created_at: '2026-01-22 18:30:00' },
    { email: 'david.kuo@example.com', name: '郭家維 (David)', phone: '0955-123-456', created_at: '2026-02-01 11:05:00' },
    { email: 'emily.huang@example.com', name: '黃羽萱 (Emily)', phone: '0966-234-567', created_at: '2026-02-05 16:42:00' },
    { email: 'frank.liu@example.com', name: '劉柏翰 (Frank)', phone: '0977-345-678', created_at: '2026-02-12 10:15:00' },
    { email: 'grace.chang@example.com', name: '張庭瑄 (Grace)', phone: '0988-456-789', created_at: '2026-02-18 20:01:00' },
    { email: 'henry.wu@example.com', name: '吳冠宇 (Henry)', phone: '0910-567-890', created_at: '2026-02-25 13:50:00' },
    { email: 'iris.yang@example.com', name: '楊佳蓉 (Iris)', phone: '0920-678-901', created_at: '2026-03-01 08:33:00' },
    { email: 'jack.chen@example.com', name: '陳俊傑 (Jack)', phone: '0930-789-012', created_at: '2026-03-02 12:20:00' },
    { email: 'kelly.lai@example.com', name: '賴曉玲 (Kelly)', phone: '0940-890-123', created_at: '2026-03-03 17:45:00' },
    { email: 'leo.tsai@example.com', name: '蔡宗翰 (Leo)', phone: '0950-901-234', created_at: '2026-03-04 19:10:00' }
];

const insertUser = db.prepare(`
    INSERT INTO users (email, name, phone, created_at)
    VALUES (?, ?, ?, ?)
`);
for (const u of users) {
    insertUser.run(u.email, u.name, u.phone, u.created_at);
}
console.log(`   ✔ 已匯入 ${users.length} 筆會員資料`);

// 2. 商品測試資料 (14 款多元商品)
const products = [
    { product_name: 'iPhone 16 Pro 256GB', price: 36900, description: 'Apple 原廠旗艦機，鈦金屬邊框與 48MP 鏡頭', stock: 15 },
    { product_name: 'AirPods Pro 2 (USB-C)', price: 7490, description: '主動降噪耳機，適應性音訊與長效續航', stock: 40 },
    { product_name: 'MacBook Air 15吋 M3', price: 42900, description: '極致輕薄筆電，16GB 統一記憶體 / 512GB SSD', stock: 10 },
    { product_name: 'USB-C 編織快速充電線 2M', price: 590, description: '最高支援 100W PD 快充，耐折抗磨損', stock: 120 },
    { product_name: '極簡人體工學透氣網椅', price: 8990, description: '全椅透氣網布，四段自適應腰靠支撐', stock: 8 },
    { product_name: 'GaN 氮化鎵 65W 三孔快充頭', price: 1190, description: '支援 2C1A 同時輸出，體積小巧好攜帶', stock: 75 },
    { product_name: '三模機械式 RGB 鍵盤 (茶軸)', price: 3280, description: '支援藍牙/2.4G/有線三模，PBT 熱昇華鍵帽', stock: 25 },
    { product_name: '人體工學靜音垂直滑鼠', price: 1580, description: '57度握角減輕手腕負擔，支援跨裝置切換', stock: 35 },
    { product_name: '27吋 4K HDR 專業設計螢幕', price: 14900, description: 'IPS面板 99% sRGB，支援 USB-C 90W 反向供電', stock: 6 },
    { product_name: '雙層不銹鋼陶瓷易潔保溫杯 500ml', price: 780, description: '內膽陶瓷易潔層，不卡咖啡與茶垢', stock: 50 },
    { product_name: '精品中深焙濾掛咖啡組 (20入)', price: 620, description: '帶有黑巧克力與堅果香氣，手工挑豆烘焙', stock: 60 },
    { product_name: '日系抗藍光平光護眼鏡', price: 1280, description: '超輕鈦金屬鏡架，有效濾除40%有害藍光', stock: 30 },
    { product_name: '高階降噪耳罩式無線耳機', price: 9900, description: '業界頂級主動降噪，30小時超長續航力', stock: 12 },
    { product_name: '防潑水商務機能電腦後背包', price: 2180, description: '可容納 16 吋筆電，具備獨立乾濕分離層', stock: 28 }
];

const insertProduct = db.prepare(`
    INSERT INTO products (product_name, price, description, stock)
    VALUES (?, ?, ?, ?)
`);
for (const p of products) {
    insertProduct.run(p.product_name, p.price, p.description, p.stock);
}
console.log(`   ✔ 已匯入 ${products.length} 款商品資料`);

// 3. 購買紀錄測試資料 (30 筆真實消費情境)
const purchases = [
    // Alice 的購買紀錄 (忠實果粉)
    { user_id: 1, product_id: 1, quantity: 1, purchase_price: 36900, status: 'completed', purchased_at: '2026-02-01 10:30:00' },
    { user_id: 1, product_id: 4, quantity: 2, purchase_price: 590,   status: 'completed', purchased_at: '2026-02-01 10:30:00' },
    { user_id: 1, product_id: 2, quantity: 1, purchase_price: 6990,  status: 'completed', purchased_at: '2026-02-14 19:15:00' }, // 特價時購入
    { user_id: 1, product_id: 10, quantity: 1, purchase_price: 780,  status: 'completed', purchased_at: '2026-02-28 12:00:00' },

    // Bob 的購買紀錄 (居家辦公升級)
    { user_id: 2, product_id: 5, quantity: 1, purchase_price: 8990, status: 'completed', purchased_at: '2026-02-10 14:20:00' },
    { user_id: 2, product_id: 7, quantity: 1, purchase_price: 3280, status: 'completed', purchased_at: '2026-02-10 14:20:00' },
    { user_id: 2, product_id: 8, quantity: 1, purchase_price: 1580, status: 'completed', purchased_at: '2026-02-10 14:20:00' },
    { user_id: 2, product_id: 9, quantity: 1, purchase_price: 14900, status: 'completed', purchased_at: '2026-02-18 09:40:00' },

    // Charlie 的購買紀錄 (筆電與配件)
    { user_id: 3, product_id: 3, quantity: 1, purchase_price: 42900, status: 'completed', purchased_at: '2026-02-05 11:25:00' },
    { user_id: 3, product_id: 6, quantity: 1, purchase_price: 1190,  status: 'completed', purchased_at: '2026-02-05 11:25:00' },
    { user_id: 3, product_id: 14, quantity: 1, purchase_price: 2180, status: 'completed', purchased_at: '2026-02-05 11:25:00' },

    // David 的購買紀錄 (耳機與配件)
    { user_id: 4, product_id: 13, quantity: 1, purchase_price: 9900, status: 'completed', purchased_at: '2026-02-15 16:30:00' },
    { user_id: 4, product_id: 11, quantity: 2, purchase_price: 620,  status: 'completed', purchased_at: '2026-02-20 08:15:00' },
    { user_id: 4, product_id: 4, quantity: 1, purchase_price: 590,   status: 'refunded',  purchased_at: '2026-02-22 17:00:00' }, // 申請退貨

    // Emily 的購買紀錄 (咖啡生活系列)
    { user_id: 5, product_id: 10, quantity: 2, purchase_price: 780,  status: 'completed', purchased_at: '2026-02-12 13:10:00' },
    { user_id: 5, product_id: 11, quantity: 3, purchase_price: 600,  status: 'completed', purchased_at: '2026-02-12 13:10:00' }, // 團購特惠
    { user_id: 5, product_id: 12, quantity: 1, purchase_price: 1280, status: 'completed', purchased_at: '2026-03-01 20:45:00' },

    // Frank 的購買紀錄
    { user_id: 6, product_id: 6, quantity: 2, purchase_price: 1190, status: 'completed', purchased_at: '2026-02-25 15:00:00' },
    { user_id: 6, product_id: 4, quantity: 3, purchase_price: 590,  status: 'completed', purchased_at: '2026-02-25 15:00:00' },

    // Grace 的購買紀錄 (辦公與降噪)
    { user_id: 7, product_id: 2, quantity: 1, purchase_price: 7490,  status: 'completed', purchased_at: '2026-02-26 18:20:00' },
    { user_id: 7, product_id: 8, quantity: 1, purchase_price: 1580,  status: 'completed', purchased_at: '2026-02-26 18:20:00' },
    { user_id: 7, product_id: 12, quantity: 1, purchase_price: 1280, status: 'pending',   purchased_at: '2026-03-05 09:10:00' }, // 處理中

    // Henry 的購買紀錄
    { user_id: 8, product_id: 7, quantity: 1, purchase_price: 3280, status: 'completed', purchased_at: '2026-03-01 10:05:00' },
    { user_id: 8, product_id: 4, quantity: 1, purchase_price: 590,  status: 'cancelled', purchased_at: '2026-03-02 11:30:00' }, // 取消訂單

    // Iris 的購買紀錄
    { user_id: 9, product_id: 1, quantity: 1, purchase_price: 36900, status: 'completed', purchased_at: '2026-03-02 14:00:00' },
    { user_id: 9, product_id: 2, quantity: 1, purchase_price: 7490,  status: 'completed', purchased_at: '2026-03-02 14:00:00' },

    // Jack 的購買紀錄
    { user_id: 10, product_id: 14, quantity: 1, purchase_price: 2180, status: 'completed', purchased_at: '2026-03-03 16:20:00' },
    { user_id: 10, product_id: 6, quantity: 1, purchase_price: 1190,  status: 'completed', purchased_at: '2026-03-03 16:20:00' },

    // Kelly 的購買紀錄 (新用戶下單)
    { user_id: 11, product_id: 10, quantity: 1, purchase_price: 780, status: 'pending', purchased_at: '2026-03-05 08:30:00' },
    { user_id: 11, product_id: 11, quantity: 1, purchase_price: 620, status: 'pending', purchased_at: '2026-03-05 08:30:00' }
];

const insertPurchase = db.prepare(`
    INSERT INTO user_products (user_id, product_id, quantity, purchase_price, status, purchased_at)
    VALUES (?, ?, ?, ?, ?, ?)
`);
for (const pc of purchases) {
    insertPurchase.run(pc.user_id, pc.product_id, pc.quantity, pc.purchase_price, pc.status, pc.purchased_at);
}
console.log(`   ✔ 已匯入 ${purchases.length} 筆購買紀錄 (涵蓋 completed, pending, refunded, cancelled)`);

console.log(`\n================== [統計報表驗證 1：會員消費總金額排行榜 Top 5] ==================`);
const topSpenders = db.prepare(`
    SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        COUNT(up.id) AS total_orders,
        SUM(up.quantity) AS total_items,
        PRINTF('$%,d', CAST(SUM(up.quantity * up.purchase_price) AS INT)) AS total_spent
    FROM users u
    JOIN user_products up ON u.id = up.user_id
    WHERE up.status = 'completed'
    GROUP BY u.id
    ORDER BY SUM(up.quantity * up.purchase_price) DESC
    LIMIT 5
`).all();
console.table(topSpenders);

console.log(`\n================== [統計報表驗證 2：商品熱銷排行榜 Top 5] ==================`);
const topProducts = db.prepare(`
    SELECT 
        p.id AS product_id,
        p.product_name,
        PRINTF('$%,d', CAST(p.price AS INT)) AS current_price,
        SUM(up.quantity) AS units_sold,
        PRINTF('$%,d', CAST(SUM(up.quantity * up.purchase_price) AS INT)) AS total_revenue
    FROM products p
    JOIN user_products up ON p.id = up.product_id
    WHERE up.status = 'completed'
    GROUP BY p.id
    ORDER BY units_sold DESC
    LIMIT 5
`).all();
console.table(topProducts);

console.log(`\n================== [統計報表驗證 3：各交易狀態分佈] ==================`);
const statusSummary = db.prepare(`
    SELECT 
        status AS order_status,
        COUNT(*) AS count,
        PRINTF('$%,d', CAST(SUM(quantity * purchase_price) AS INT)) AS subtotal
    FROM user_products
    GROUP BY status
`).all();
console.table(statusSummary);

db.close();
console.log('\n測試資料塞入完成！已成功寫入 ecommerce.db\n');
