import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'ecommerce.db');

console.log(`[1] 正在開啟資料庫: ${DB_PATH}...`);
const db = new DatabaseSync(DB_PATH);

// 取得所有實體資料表 (排除系統內部表如 sqlite_sequence)
const tables = db.prepare(`
    SELECT name 
    FROM sqlite_master 
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name ASC
`).all();

console.log(`[2] 找到 ${tables.length} 張實體資料表: ${tables.map(t => t.name).join(', ')}`);

// CSV 欄位跳脫處理函數 (處理逗號、雙引號、換行符號)
function formatCsvField(val) {
    if (val === null || val === undefined) {
        return '';
    }
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// 逐一匯出各資料表為 CSV
for (const { name: tableName } of tables) {
    const rows = db.prepare(`SELECT * FROM "${tableName}"`).all();
    
    if (rows.length === 0) {
        console.log(`   ⚠ 資料表 ${tableName} 沒有資料，產生空白 CSV...`);
        const outPath = path.join(__dirname, `${tableName}.csv`);
        fs.writeFileSync(outPath, '\uFEFF', 'utf-8');
        continue;
    }

    // 取得所有欄位名稱 (Header)
    const columns = Object.keys(rows[0]);
    const headerLine = columns.map(formatCsvField).join(',');

    // 產生每一列資料
    const dataLines = rows.map(row => {
        return columns.map(col => formatCsvField(row[col])).join(',');
    });

    // 加上 UTF-8 BOM (\uFEFF)，確保在 Windows Excel 開啟時中文不亂碼
    const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n') + '\r\n';

    const outPath = path.join(__dirname, `${tableName}.csv`);
    fs.writeFileSync(outPath, csvContent, 'utf-8');
    console.log(`   ✔ 已產出: ${tableName}.csv (${rows.length} 筆資料, 欄位: ${columns.join(', ')})`);
}

db.close();
console.log('\n所有資料表已全數成功匯出為 CSV 檔案！\n');
