import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'ecommerce.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

console.log(`[1] 正在連接 / 建立 SQLite 資料庫: ${DB_PATH}...`);
const db = new DatabaseSync(DB_PATH);

// 讀取並執行 Schema
console.log(`[2] 讀取 schema.sql 並建立資料表...`);
const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schemaSql);

// 檢查是否已存在種子資料
const userCount = db.prepare('SELECT count(*) AS count FROM users').get().count;

if (userCount === 0) {
    console.log(`[3] 資料庫為空，寫入範例種子資料 (Seed Data)...`);

    // 新增會員
    const insertUser = db.prepare(`
        INSERT INTO users (email, name, phone)
        VALUES (?, ?, ?)
    `);
    insertUser.run('alice@example.com', 'Alice Chen', '0912-345-678');
    insertUser.run('bob@example.com', 'Bob Lin', '0923-456-789');
    insertUser.run('charlie@example.com', 'Charlie Wang', '0934-567-890');

    // 新增商品
    const insertProduct = db.prepare(`
        INSERT INTO products (product_name, price, description, stock)
        VALUES (?, ?, ?, ?)
    `);
    insertProduct.run('iPhone 16 Pro', 36900, '最新旗艦手機 256GB', 20);
    insertProduct.run('AirPods Pro 2', 7490, '主動式降噪無線耳機', 50);
    insertProduct.run('MacBook Air M3', 35900, '輕薄強悍筆電 16GB/512GB', 15);
    insertProduct.run('USB-C 快速充電線', 590, '編織耐用 2 公尺', 100);

    // 新增購買紀錄 (user_products)
    const insertPurchase = db.prepare(`
        INSERT INTO user_products (user_id, product_id, quantity, purchase_price, status)
        VALUES (?, ?, ?, ?, ?)
    `);
    // Alice 買了 1 台 iPhone 16 Pro 與 1 條充電線
    insertPurchase.run(1, 1, 1, 36900, 'completed');
    insertPurchase.run(1, 4, 1, 590, 'completed');

    // Bob 買了 1 個 AirPods Pro
    insertPurchase.run(2, 2, 1, 7490, 'completed');

    // Charlie 買了 1 台 MacBook Air 與 2 條充電線
    insertPurchase.run(3, 3, 1, 35900, 'completed');
    insertPurchase.run(3, 4, 2, 590, 'completed');

    console.log(`    已成功寫入 3 位會員、4 項商品、5 筆購買紀錄！`);
} else {
    console.log(`[3] 資料庫已有現成資料 (會員數: ${userCount})，跳過種子資料初始化。`);
}

// 驗證查詢
console.log(`\n================== [資料庫現況檢查] ==================`);
const tables = db.prepare(`
    SELECT name, type FROM sqlite_master 
    WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
    ORDER BY type, name
`).all();
console.log('已建立的資料表與 View:');
console.table(tables);

console.log('\n================== [會員購買清單關聯查詢 (JOIN)] ==================');
const purchaseQuery = `
    SELECT 
        up.id AS purchase_id,
        u.name AS buyer_name,
        u.email AS buyer_email,
        p.product_name,
        up.quantity,
        up.purchase_price AS unit_price,
        (up.quantity * up.purchase_price) AS total_price,
        up.status,
        up.purchased_at
    FROM user_products up
    JOIN users u ON up.user_id = u.id
    JOIN products p ON up.product_id = p.id
    ORDER BY up.id ASC
`;
const purchases = db.prepare(purchaseQuery).all();
console.table(purchases);

db.close();
console.log('\nSQLite 資料庫初始化完成！檔案路徑: ecommerce.db\n');
