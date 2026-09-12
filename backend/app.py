import os
import sys
from flask import Flask, jsonify, request, Response
from flask_cors import CORS

# 確保可正確載入同一層模組
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import db
import seed
import csv_exporter

app = Flask(__name__)
# 允許跨域請求 (開發階段相容)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康狀態檢查與資料庫連線確認"""
    try:
        kpis = db.get_kpis()
        return jsonify({
            "status": "online",
            "backend": "Python Flask 3.1",
            "database": "SQLite 3",
            "stats": kpis
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/api/seed/reset', methods=['POST'])
def reset_and_seed():
    """一鍵重置資料庫並重新注入 Phase 2 擬真測試資料"""
    try:
        result = seed.run_seed()
        kpis = db.get_kpis()
        return jsonify({
            "success": True,
            "message": "資料庫已成功重置並注入 Phase 2 測試資料！",
            "data": {
                "seeded": result,
                "current_kpis": kpis
            }
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/analytics/kpis', methods=['GET'])
def get_kpis():
    """頂部四大關鍵指標"""
    try:
        data = db.get_kpis()
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/top-spenders', methods=['GET'])
def get_top_spenders():
    """【商業分析 1】VIP 會員累計消費榜 Top N"""
    try:
        limit = int(request.args.get('limit', 5))
        data = db.get_top_spenders(limit=limit)
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/top-products', methods=['GET'])
def get_top_products():
    """【商業分析 2】熱銷商品排行榜 Top N"""
    try:
        limit = int(request.args.get('limit', 5))
        data = db.get_top_products(limit=limit)
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/status-distribution', methods=['GET'])
def get_status_distribution():
    """【商業分析 3】訂單狀態分佈統計"""
    try:
        data = db.get_status_distribution()
        return jsonify({"success": True, "data": data}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/users', methods=['GET', 'POST'])
def handle_users():
    """會員列表與新增會員"""
    if request.method == 'GET':
        try:
            users = db.get_all_users()
            return jsonify({"success": True, "data": users}), 200
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    elif request.method == 'POST':
        body = request.get_json() or {}
        email = body.get('email', '').strip()
        name = body.get('name', '').strip()
        phone = body.get('phone', '').strip() or None

        if not email or not name:
            return jsonify({"success": False, "error": "Email 與姓名為必填欄位"}), 400

        try:
            new_user = db.create_user(email, name, phone)
            return jsonify({"success": True, "data": new_user}), 201
        except Exception as e:
            err_msg = str(e)
            if "UNIQUE constraint failed" in err_msg:
                return jsonify({"success": False, "error": f"該 Email ({email}) 已經被註冊過"}), 409
            return jsonify({"success": False, "error": err_msg}), 500

@app.route('/api/products', methods=['GET', 'POST'])
def handle_products():
    """商品列表與上架商品"""
    if request.method == 'GET':
        try:
            products = db.get_all_products()
            return jsonify({"success": True, "data": products}), 200
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    elif request.method == 'POST':
        body = request.get_json() or {}
        product_name = body.get('product_name', '').strip()
        price = body.get('price')
        description = body.get('description', '').strip() or None
        stock = body.get('stock', 0)

        if not product_name or price is None:
            return jsonify({"success": False, "error": "商品名稱與單價為必填欄位"}), 400

        try:
            price = float(price)
            stock = int(stock)
            if price < 0 or stock < 0:
                return jsonify({"success": False, "error": "單價與庫存不可為負數"}), 400

            new_prod = db.create_product(product_name, price, description, stock)
            return jsonify({"success": True, "data": new_prod}), 201
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/purchases', methods=['GET', 'POST'])
def handle_purchases():
    """購買明細列表與下單交易"""
    if request.method == 'GET':
        try:
            purchases = db.get_all_purchases()
            return jsonify({"success": True, "data": purchases}), 200
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    elif request.method == 'POST':
        body = request.get_json() or {}
        user_id = body.get('user_id')
        product_id = body.get('product_id')
        quantity = int(body.get('quantity', 1))
        status = body.get('status', 'completed')

        if not user_id or not product_id:
            return jsonify({"success": False, "error": "user_id 與 product_id 為必填"}), 400
        if quantity <= 0:
            return jsonify({"success": False, "error": "購買數量必須大於 0"}), 400

        try:
            new_purchase = db.create_purchase(int(user_id), int(product_id), quantity, status)
            return jsonify({"success": True, "data": new_purchase}), 201
        except ValueError as ve:
            return jsonify({"success": False, "error": str(ve)}), 422
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

# ============================================================
# Phase 3: 批次 CSV 匯出與防亂碼管線 API 端點
# ============================================================

@app.route('/api/export/csv/tables', methods=['GET'])
def get_exportable_tables():
    """動態取得所有可匯出之實體資料表綱要與資料筆數"""
    try:
        tables = csv_exporter.discover_tables()
        return jsonify({"success": True, "data": tables}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/export/csv/<table_name>', methods=['GET'])
def download_table_csv(table_name):
    """直接以附件形式串流下載單一資料表 CSV (含 UTF-8 BOM，Excel 防亂碼)"""
    try:
        # 安全性檢驗：確認請求的資料表在可匯出清單內，防止 SQL 注入
        allowed_tables = [t['table_name'] for t in csv_exporter.discover_tables()]
        if table_name not in allowed_tables:
            return jsonify({"success": False, "error": f"不合法的資料表名稱：{table_name}"}), 404

        csv_content = csv_exporter.export_table_to_csv_string(table_name)

        return Response(
            csv_content,
            mimetype="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": f"attachment; filename={table_name}.csv",
                "Cache-Control": "no-cache"
            }
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/export/csv/<table_name>/preview', methods=['GET'])
def preview_table_csv(table_name):
    """取得資料表 CSV 前 15 行純文字預覽 (供前端抽屜視窗檢視)"""
    try:
        allowed_tables = [t['table_name'] for t in csv_exporter.discover_tables()]
        if table_name not in allowed_tables:
            return jsonify({"success": False, "error": f"不合法的資料表名稱：{table_name}"}), 404

        csv_content = csv_exporter.export_table_to_csv_string(table_name)
        lines = csv_content.splitlines()[:15]
        return jsonify({
            "success": True,
            "data": {
                "table_name": table_name,
                "preview_lines": lines,
                "total_preview_lines": len(lines)
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/export/csv/batch', methods=['POST'])
def batch_export_to_disk():
    """觸發伺服器端批次匯出所有資料表至專案根目錄"""
    try:
        exported_files = csv_exporter.export_all_tables_to_disk()
        return jsonify({
            "success": True,
            "message": f"成功批次匯出 {len(exported_files)} 個 CSV 檔案至伺服器磁碟！",
            "data": exported_files
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Python Flask 後端 API 服務啟動於 http://127.0.0.1:{port}")
    app.run(host='127.0.0.1', port=port, debug=False)
