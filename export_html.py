import sqlite3
import os
import sys
import html
from datetime import datetime

# 設定終端機輸出為 UTF-8 編碼
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# 取得目前檔案路徑
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'ecommerce.db')
HTML_PATH = os.path.join(BASE_DIR, 'database_view.html')

def get_db_data():
    """讀取 SQLite 資料庫中的三張資料表與統計數據"""
    if not os.path.exists(DB_PATH):
        raise FileNotFoundError(f"找不到資料庫檔案：{DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # 允許使用欄位名稱存取
    cursor = conn.cursor()

    # 1. 讀取 users
    cursor.execute("SELECT * FROM users ORDER BY id ASC")
    users = [dict(row) for row in cursor.fetchall()]

    # 2. 讀取 products
    cursor.execute("SELECT * FROM products ORDER BY id ASC")
    products = [dict(row) for row in cursor.fetchall()]

    # 3. 讀取 user_products (含與 users 及 products 的 JOIN 資訊，呈現更完整)
    query_purchases = """
        SELECT 
            up.id,
            up.user_id,
            u.name AS user_name,
            u.email AS user_email,
            up.product_id,
            p.product_name,
            up.quantity,
            up.purchase_price,
            (up.quantity * up.purchase_price) AS subtotal,
            up.status,
            up.purchased_at
        FROM user_products up
        LEFT JOIN users u ON up.user_id = u.id
        LEFT JOIN products p ON up.product_id = p.id
        ORDER BY up.id ASC
    """
    cursor.execute(query_purchases)
    user_products = [dict(row) for row in cursor.fetchall()]

    # 4. 統計指標
    total_users = len(users)
    total_products = len(products)
    total_orders = len(user_products)
    total_revenue = sum(item['subtotal'] for item in user_products if item['status'] == 'completed')

    conn.close()

    return {
        'users': users,
        'products': products,
        'user_products': user_products,
        'stats': {
            'total_users': total_users,
            'total_products': total_products,
            'total_orders': total_orders,
            'total_revenue': total_revenue
        }
    }

def render_status_badge(status):
    """回傳狀態徽章 HTML"""
    badges = {
        'completed': ('bg-emerald-100 text-emerald-800 border-emerald-300', '已完成 (completed)'),
        'pending': ('bg-amber-100 text-amber-800 border-amber-300', '處理中 (pending)'),
        'refunded': ('bg-rose-100 text-rose-800 border-rose-300', '已退款 (refunded)'),
        'cancelled': ('bg-slate-100 text-slate-700 border-slate-300', '已取消 (cancelled)')
    }
    cls, text = badges.get(status, ('bg-gray-100 text-gray-700 border-gray-300', status))
    return f'<span class="badge {cls}">{html.escape(text)}</span>'

def generate_html(data):
    """產生現代化單一檔案 HTML"""
    users = data['users']
    products = data['products']
    user_products = data['user_products']
    stats = data['stats']
    now_str = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 生成 Users 表格列
    user_rows = []
    for u in users:
        user_rows.append(f"""
            <tr>
                <td class="font-mono text-center">{u['id']}</td>
                <td class="font-medium text-slate-900">{html.escape(str(u['name']))}</td>
                <td class="text-indigo-600">{html.escape(str(u['email']))}</td>
                <td class="font-mono text-slate-600">{html.escape(str(u['phone'] or '—'))}</td>
                <td class="text-xs text-slate-500 font-mono">{html.escape(str(u['created_at']))}</td>
                <td class="text-xs text-slate-500 font-mono">{html.escape(str(u['updated_at']))}</td>
            </tr>
        """)
    users_tbody = "\n".join(user_rows)

    # 生成 Products 表格列
    product_rows = []
    for p in products:
        stock_badge = f'<span class="px-2 py-0.5 text-xs font-semibold rounded {"bg-red-100 text-red-700" if p["stock"] <= 10 else "bg-slate-100 text-slate-700"}">{p["stock"]} 件</span>'
        product_rows.append(f"""
            <tr>
                <td class="font-mono text-center">{p['id']}</td>
                <td class="font-medium text-slate-900">{html.escape(str(p['product_name']))}</td>
                <td class="font-mono font-semibold text-emerald-700">NT$ {p['price']:,.0f}</td>
                <td class="text-slate-600 text-sm max-w-xs truncate" title="{html.escape(str(p['description'] or ''))}">{html.escape(str(p['description'] or '—'))}</td>
                <td class="text-center">{stock_badge}</td>
                <td class="text-xs text-slate-500 font-mono">{html.escape(str(p['created_at']))}</td>
            </tr>
        """)
    products_tbody = "\n".join(product_rows)

    # 生成 User_Products 表格列
    user_product_rows = []
    for up in user_products:
        badge = render_status_badge(up['status'])
        user_product_rows.append(f"""
            <tr>
                <td class="font-mono text-center font-bold text-slate-700">{up['id']}</td>
                <td class="text-slate-900">
                    <div class="font-medium">{html.escape(str(up['user_name'] or '未知'))}</div>
                    <div class="text-xs text-slate-400 font-mono">user_id: {up['user_id']} | {html.escape(str(up['user_email'] or ''))}</div>
                </td>
                <td class="text-slate-900">
                    <div class="font-medium">{html.escape(str(up['product_name'] or '未知商品'))}</div>
                    <div class="text-xs text-slate-400 font-mono">product_id: {up['product_id']}</div>
                </td>
                <td class="font-mono text-center font-semibold">{up['quantity']}</td>
                <td class="font-mono text-right text-slate-600">NT$ {up['purchase_price']:,.0f}</td>
                <td class="font-mono text-right font-bold text-emerald-700">NT$ {up['subtotal']:,.0f}</td>
                <td class="text-center">{badge}</td>
                <td class="text-xs text-slate-500 font-mono">{html.escape(str(up['purchased_at']))}</td>
            </tr>
        """)
    user_products_tbody = "\n".join(user_product_rows)

    html_content = f"""<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SQLite 資料庫檢視器 - 會員與購物系統</title>
    <style>
        *, ::before, ::after {{
            box-sizing: border-box;
            border-width: 0;
            border-style: solid;
            border-color: #e2e8f0;
        }}
        body {{
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
        }}
        .container {{
            max-width: 1280px;
            margin: 0 auto;
            padding: 2rem 1.5rem;
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1rem;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 1.25rem;
        }}
        .title-group h1 {{
            font-size: 1.75rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 0.25rem 0;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }}
        .subtitle {{
            color: #64748b;
            font-size: 0.875rem;
            margin: 0;
        }}
        .badge-source {{
            display: inline-flex;
            align-items: center;
            background: #e0e7ff;
            color: #4338ca;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            font-family: monospace;
        }}
        /* 數據卡片 */
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1.25rem;
            margin-bottom: 2rem;
        }}
        .stat-card {{
            background: #ffffff;
            border-radius: 0.75rem;
            padding: 1.25rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03);
            border: 1px solid #e2e8f0;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
        }}
        .stat-card:hover {{
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
        }}
        .stat-title {{
            font-size: 0.875rem;
            color: #64748b;
            font-weight: 500;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }}
        .stat-value {{
            font-size: 1.75rem;
            font-weight: 700;
            color: #0f172a;
            font-family: monospace;
        }}
        /* 分頁標籤 */
        .tabs-container {{
            background: #ffffff;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
            overflow: hidden;
        }}
        .tabs-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
            padding: 0.5rem 1rem;
            flex-wrap: wrap;
            gap: 0.75rem;
        }}
        .tabs-list {{
            display: flex;
            gap: 0.5rem;
        }}
        .tab-btn {{
            background: none;
            border: none;
            padding: 0.6rem 1.1rem;
            font-size: 0.925rem;
            font-weight: 600;
            color: #64748b;
            cursor: pointer;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            transition: all 0.2s;
        }}
        .tab-btn:hover {{
            color: #0f172a;
            background: #e2e8f0;
        }}
        .tab-btn.active {{
            background: #3b82f6;
            color: #ffffff;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }}
        .search-box {{
            padding: 0.5rem 0.875rem;
            border: 1px solid #cbd5e1;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            outline: none;
            width: 260px;
            background: #ffffff;
        }}
        .search-box:focus {{
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }}
        /* 表格樣式 */
        .table-wrapper {{
            overflow-x: auto;
            width: 100%;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.875rem;
        }}
        th {{
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 600;
            padding: 0.875rem 1rem;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #e2e8f0;
        }}
        td {{
            padding: 0.875rem 1rem;
            border-bottom: 1px solid #f1f5f9;
        }}
        tbody tr:hover {{
            background-color: #f8fafc;
        }}
        /* 標籤 (Badge) */
        .badge {{
            display: inline-block;
            padding: 0.25rem 0.6rem;
            font-size: 0.75rem;
            font-weight: 600;
            border-radius: 9999px;
            border: 1px solid;
            white-space: nowrap;
        }}
        .bg-emerald-100 {{ background-color: #d1fae5; }}
        .text-emerald-800 {{ color: #065f46; }}
        .border-emerald-300 {{ border-color: #6ee7b7; }}
        .bg-amber-100 {{ background-color: #fef3c7; }}
        .text-amber-800 {{ color: #92400e; }}
        .border-amber-300 {{ border-color: #fcd34d; }}
        .bg-rose-100 {{ background-color: #ffe4e6; }}
        .text-rose-800 {{ color: #9f1239; }}
        .border-rose-300 {{ border-color: #fda4af; }}
        .bg-slate-100 {{ background-color: #f1f5f9; }}
        .text-slate-700 {{ color: #334155; }}
        .border-slate-300 {{ border-color: #cbd5e1; }}
        /* 輔助樣式 */
        .font-mono {{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }}
        .font-semibold {{ font-weight: 600; }}
        .font-bold {{ font-weight: 700; }}
        .font-medium {{ font-weight: 500; }}
        .text-center {{ text-align: center; }}
        .text-right {{ text-align: right; }}
        .text-emerald-700 {{ color: #047857; }}
        .text-indigo-600 {{ color: #4f46e5; }}
        .text-slate-400 {{ color: #94a3b8; }}
        .text-slate-500 {{ color: #64748b; }}
        .text-slate-600 {{ color: #475569; }}
        .text-slate-900 {{ color: #0f172a; }}
        .text-xs {{ font-size: 0.75rem; }}
        .text-sm {{ font-size: 0.875rem; }}
        .truncate {{
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }}
        .max-w-xs {{ max-width: 20rem; }}
        .tab-panel {{ display: none; }}
        .tab-panel.active {{ display: block; }}
        .footer {{
            margin-top: 2rem;
            text-align: center;
            font-size: 0.8rem;
            color: #94a3b8;
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- 頂部標頭 -->
        <header class="header">
            <div class="title-group">
                <h1>📦 SQLite 資料庫視覺化儀表板</h1>
                <p class="subtitle">由 Python (sqlite3) 自動讀取資料庫結構與紀錄產出 • 更新時間：{now_str}</p>
            </div>
            <div>
                <span class="badge-source">資料庫：ecommerce.db</span>
            </div>
        </header>

        <!-- 數據統計卡片 -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-title">👥 註冊會員總數 (users)</div>
                <div class="stat-value">{stats['total_users']} <span style="font-size: 0.9rem; color: #64748b; font-weight: normal;">人</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-title">📦 上架商品款數 (products)</div>
                <div class="stat-value">{stats['total_products']} <span style="font-size: 0.9rem; color: #64748b; font-weight: normal;">項</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-title">🛒 購買紀錄總筆數 (user_products)</div>
                <div class="stat-value">{stats['total_orders']} <span style="font-size: 0.9rem; color: #64748b; font-weight: normal;">筆</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-title">💰 已完成成交總額</div>
                <div class="stat-value" style="color: #047857;">NT$ {stats['total_revenue']:,.0f}</div>
            </div>
        </div>

        <!-- 分頁切換區塊 -->
        <div class="tabs-container">
            <div class="tabs-header">
                <div class="tabs-list">
                    <button class="tab-btn active" onclick="switchTab('user_products', this)">
                        🛒 user_products 表 ({len(user_products)})
                    </button>
                    <button class="tab-btn" onclick="switchTab('users', this)">
                        👥 users 表 ({len(users)})
                    </button>
                    <button class="tab-btn" onclick="switchTab('products', this)">
                        📦 products 表 ({len(products)})
                    </button>
                </div>
                <input type="text" id="searchInput" class="search-box" placeholder="🔍 快速篩選當前表格內容..." onkeyup="filterTable()">
            </div>

            <!-- Tab 1: user_products -->
            <div id="tab-user_products" class="tab-panel active">
                <div class="table-wrapper">
                    <table id="table-user_products">
                        <thead>
                            <tr>
                                <th class="text-center" style="width: 60px;">ID</th>
                                <th>購買會員 (user_id / 姓名 / Email)</th>
                                <th>購買商品 (product_id / 名稱)</th>
                                <th class="text-center">數量</th>
                                <th class="text-right">成交單價</th>
                                <th class="text-right">小計金額</th>
                                <th class="text-center">訂單狀態</th>
                                <th>購買時間 (purchased_at)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {user_products_tbody}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Tab 2: users -->
            <div id="tab-users" class="tab-panel">
                <div class="table-wrapper">
                    <table id="table-users">
                        <thead>
                            <tr>
                                <th class="text-center" style="width: 60px;">ID</th>
                                <th>姓名 (name)</th>
                                <th>電子郵件 (email)</th>
                                <th>電話號碼 (phone)</th>
                                <th>註冊時間 (created_at)</th>
                                <th>最後更新 (updated_at)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users_tbody}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Tab 3: products -->
            <div id="tab-products" class="tab-panel">
                <div class="table-wrapper">
                    <table id="table-products">
                        <thead>
                            <tr>
                                <th class="text-center" style="width: 60px;">ID</th>
                                <th>商品名稱 (product_name)</th>
                                <th>當前單價 (price)</th>
                                <th>商品簡述 (description)</th>
                                <th class="text-center">庫存數量 (stock)</th>
                                <th>上架時間 (created_at)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products_tbody}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Generated by Python SQLite Exporter • 單一獨立 HTML 檔案，可直接雙擊在任何瀏覽器開啟</p>
        </div>
    </div>

    <script>
        function switchTab(tabName, btn) {{
            // 隱藏所有分頁
            document.querySelectorAll('.tab-panel').forEach(panel => {{
                panel.classList.remove('active');
            }});
            // 移除所有按鈕 active 樣式
            document.querySelectorAll('.tab-btn').forEach(b => {{
                b.classList.remove('active');
            }});
            // 顯示目標分頁與樣式
            document.getElementById('tab-' + tabName).classList.add('active');
            btn.classList.add('active');

            // 切換時重新觸發搜尋篩選
            filterTable();
        }}

        function filterTable() {{
            const query = document.getElementById('searchInput').value.toLowerCase();
            const activePanel = document.querySelector('.tab-panel.active');
            if (!activePanel) return;

            const rows = activePanel.querySelectorAll('tbody tr');
            rows.forEach(row => {{
                const text = row.textContent.toLowerCase();
                if (text.includes(query)) {{
                    row.style.display = '';
                }} else {{
                    row.style.display = 'none';
                }}
            }});
        }}
    </script>
</body>
</html>
"""
    with open(HTML_PATH, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"[OK] 成功輸出 HTML 檔案：{HTML_PATH}")
    print(f"    - 會員筆數：{len(users)}")
    print(f"    - 商品筆數：{len(products)}")
    print(f"    - 購買筆數：{len(user_products)}")

if __name__ == '__main__':
    print(f"[1] 正在使用 Python 讀取資料庫：{DB_PATH}...")
    db_data = get_db_data()
    print("[2] 正在產出現代化 HTML 檢視器...")
    generate_html(db_data)
