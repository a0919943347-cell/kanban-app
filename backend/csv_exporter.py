import sqlite3
import os
import sys

# 確保可引用同目錄模組
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from db import get_connection, BASE_DIR

def discover_tables():
    """動態探索資料庫中所有使用者實體表 (排除系統表如 sqlite_sequence)"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        query = """
            SELECT name 
            FROM sqlite_master 
            WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name ASC
        """
        cursor.execute(query)
        tables = [row['name'] for row in cursor.fetchall()]

        table_details = []
        for tbl in tables:
            cursor.execute(f"SELECT COUNT(*) AS count FROM \"{tbl}\"")
            row_count = cursor.fetchone()['count']

            cursor.execute(f"PRAGMA table_info(\"{tbl}\")")
            columns = [c['name'] for c in cursor.fetchall()]

            table_details.append({
                "table_name": tbl,
                "row_count": row_count,
                "columns": columns,
                "estimated_size_kb": round(row_count * len(columns) * 0.05, 2)
            })

        return table_details
    finally:
        conn.close()

def format_csv_value(val):
    """嚴格遵循 RFC 4180 標準的 CSV 欄位跳脫函數"""
    if val is None:
        return ""
    str_val = str(val)
    # 若欄位包含逗號、引號或換行符號，需以雙引號包裹，且內部引號轉換為兩個雙引號
    if ',' in str_val or '"' in str_val or '\n' in str_val or '\r' in str_val:
        escaped = str_val.replace('"', '""')
        return f'"{escaped}"'
    return str_val

def export_table_to_csv_string(table_name):
    """將單一資料表內容導出為含 UTF-8 BOM 之 CSV 字串"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(f"SELECT * FROM \"{table_name}\"")
        rows = cursor.fetchall()

        if not rows:
            cursor.execute(f"PRAGMA table_info(\"{table_name}\")")
            columns = [c['name'] for c in cursor.fetchall()]
            header_line = ",".join(format_csv_value(col) for col in columns)
            # 注入 UTF-8 BOM (\uFEFF)
            return '\ufeff' + header_line + '\r\n'

        columns = list(rows[0].keys())
        header_line = ",".join(format_csv_value(col) for col in columns)

        data_lines = []
        for r in rows:
            line = ",".join(format_csv_value(r[col]) for col in columns)
            data_lines.append(line)

        # 注入 UTF-8 BOM 並使用 Windows CRLF 換行
        csv_content = '\ufeff' + "\r\n".join([header_line] + data_lines) + '\r\n'
        return csv_content
    finally:
        conn.close()

def export_all_tables_to_disk(target_dir=None):
    """批次將所有實體表匯出至指定目錄 (預設為專案根目錄)"""
    if target_dir is None:
        target_dir = BASE_DIR

    tables = discover_tables()
    exported_files = []

    for t in tables:
        tbl_name = t['table_name']
        csv_content = export_table_to_csv_string(tbl_name)
        file_path = os.path.join(target_dir, f"{tbl_name}.csv")

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(csv_content)

        file_size = os.path.getsize(file_path)
        exported_files.append({
            "table_name": tbl_name,
            "file_name": f"{tbl_name}.csv",
            "file_path": file_path,
            "row_count": t['row_count'],
            "file_size_bytes": file_size
        })

    return exported_files

if __name__ == '__main__':
    print("[1] 探索資料庫實體表:")
    print(discover_tables())
    print("\n[2] 執行批次匯出至磁碟:")
    files = export_all_tables_to_disk()
    for f in files:
        print(f"  ✔ {f['file_name']} ({f['row_count']} 筆, {f['file_size_bytes']} bytes)")
