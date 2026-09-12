import sqlite3
import os
import sys

# 設定終端機輸出為 UTF-8
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# 專案路徑常數
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'ecommerce.db')
SCHEMA_PATH = os.path.join(BASE_DIR, 'schema.sql')

def get_connection():
    """建立並取得 SQLite 資料庫連線，強制開啟外鍵約束與字典格式回傳"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_schema():
    """重建資料表結構"""
    if not os.path.exists(SCHEMA_PATH):
        raise FileNotFoundError(f"找不到 schema.sql 檔案：{SCHEMA_PATH}")

    with open(SCHEMA_PATH, 'r', encoding='utf-8') as f:
        schema_sql = f.read()

    conn = get_connection()
    try:
        cursor = conn.cursor()
        # 清除舊的 View 與 Table
        cursor.executescript("""
            DROP VIEW IF EXISTS user_product;
            DROP VIEW IF EXISTS product;
            DROP VIEW IF EXISTS user;
            DROP TABLE IF EXISTS user_products;
            DROP TABLE IF EXISTS products;
            DROP TABLE IF EXISTS users;
        """)
        # 執行建立
        cursor.executescript(schema_sql)
        conn.commit()
    finally:
        conn.close()

def get_kpis():
    """獲取整體關鍵營運指標 (KPIs)"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) AS count FROM users")
        total_users = cursor.fetchone()['count']

        cursor.execute("SELECT COUNT(*) AS count FROM products")
        total_products = cursor.fetchone()['count']

        cursor.execute("SELECT COUNT(*) AS count FROM user_products")
        total_orders = cursor.fetchone()['count']

        cursor.execute("""
            SELECT COALESCE(SUM(quantity * purchase_price), 0) AS total_revenue
            FROM user_products
            WHERE status = 'completed'
        """)
        total_revenue = cursor.fetchone()['total_revenue']

        return {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": float(total_revenue)
        }
    finally:
        conn.close()

def get_top_spenders(limit=5):
    """【商業分析 1】會員累計消費排行榜 Top N (status = 'completed')"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        query = """
            SELECT 
                u.id AS user_id,
                u.name,
                u.email,
                COUNT(up.id) AS total_orders,
                SUM(up.quantity) AS total_items,
                ROUND(SUM(up.quantity * up.purchase_price), 2) AS total_spent
            FROM users u
            JOIN user_products up ON u.id = up.user_id
            WHERE up.status = 'completed'
            GROUP BY u.id
            ORDER BY total_spent DESC
            LIMIT ?
        """
        cursor.execute(query, (limit,))
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()

def get_top_products(limit=5):
    """【商業分析 2】商品銷售件數與營收熱銷榜 Top N (status = 'completed')"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        query = """
            SELECT 
                p.id AS product_id,
                p.product_name,
                p.price AS current_price,
                SUM(up.quantity) AS units_sold,
                ROUND(SUM(up.quantity * up.purchase_price), 2) AS total_revenue
            FROM products p
            JOIN user_products up ON p.id = up.product_id
            WHERE up.status = 'completed'
            GROUP BY p.id
            ORDER BY units_sold DESC, total_revenue DESC
            LIMIT ?
        """
        cursor.execute(query, (limit,))
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()

def get_status_distribution():
    """【商業分析 3】各交易狀態佔比與金額統計"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        query = """
            SELECT 
                status,
                COUNT(*) AS count,
                ROUND(SUM(quantity * purchase_price), 2) AS subtotal
            FROM user_products
            GROUP BY status
            ORDER BY count DESC
        """
        cursor.execute(query)
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()

def get_all_users():
    """查詢所有會員清單"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users ORDER BY id ASC")
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()

def get_all_products():
    """查詢所有商品型錄"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products ORDER BY id ASC")
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()

def get_all_purchases():
    """查詢購買明細 (三表 JOIN 整合視圖)"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        query = """
            SELECT 
                up.id,
                up.user_id,
                u.name AS user_name,
                u.email AS user_email,
                up.product_id,
                p.product_name,
                up.quantity,
                up.purchase_price,
                ROUND(up.quantity * up.purchase_price, 2) AS subtotal,
                up.status,
                up.purchased_at
            FROM user_products up
            LEFT JOIN users u ON up.user_id = u.id
            LEFT JOIN products p ON up.product_id = p.id
            ORDER BY up.id ASC
        """
        cursor.execute(query)
        return [dict(row) for row in cursor.fetchall()]
    finally:
        conn.close()

def create_user(email, name, phone=None):
    """新增會員"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (email, name, phone) VALUES (?, ?, ?)",
            (email, name, phone)
        )
        new_id = cursor.lastrowid
        conn.commit()
        return {"id": new_id, "email": email, "name": name, "phone": phone}
    finally:
        conn.close()

def create_product(product_name, price, description=None, stock=0):
    """新增商品"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO products (product_name, price, description, stock) VALUES (?, ?, ?, ?)",
            (product_name, price, description, stock)
        )
        new_id = cursor.lastrowid
        conn.commit()
        return {"id": new_id, "product_name": product_name, "price": price, "description": description, "stock": stock}
    finally:
        conn.close()

def create_purchase(user_id, product_id, quantity=1, status='completed'):
    """下單購買：落實事務、驗證庫存與寫入當下價格快照"""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        # 1. 查詢商品目前價格與庫存
        cursor.execute("SELECT price, stock FROM products WHERE id = ?", (product_id,))
        prod = cursor.fetchone()
        if not prod:
            raise ValueError(f"找不到 ID 為 {product_id} 的商品")
        
        if prod['stock'] < quantity:
            raise ValueError(f"庫存不足！現有庫存：{prod['stock']}，欲購買：{quantity}")

        # 2. 扣減庫存
        cursor.execute(
            "UPDATE products SET stock = stock - ? WHERE id = ?",
            (quantity, product_id)
        )

        # 3. 寫入購買明細 (使用商品當前價格作為歷史快照 purchase_price)
        current_price = prod['price']
        cursor.execute("""
            INSERT INTO user_products (user_id, product_id, quantity, purchase_price, status)
            VALUES (?, ?, ?, ?, ?)
        """, (user_id, product_id, quantity, current_price, status))

        new_id = cursor.lastrowid
        conn.commit()

        return {
            "id": new_id,
            "user_id": user_id,
            "product_id": product_id,
            "quantity": quantity,
            "purchase_price": current_price,
            "subtotal": round(quantity * current_price, 2),
            "status": status
        }
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()
