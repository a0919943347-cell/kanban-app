import unittest
import sys
import os

# 確保可引用同目錄模組
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from csv_exporter import discover_tables, format_csv_value, export_table_to_csv_string, export_all_tables_to_disk
from app import app

class TestPhase3(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_01_dynamic_discovery(self):
        """驗證動態資料表探索模組"""
        tables = discover_tables()
        table_names = [t['table_name'] for t in tables]
        self.assertIn('users', table_names, "實體表應包含 users")
        self.assertIn('products', table_names, "實體表應包含 products")
        self.assertIn('user_products', table_names, "實體表應包含 user_products")
        print(f"✔ 測試 1 通過：成功動態探測到 {len(tables)} 張實體資料表 ({', '.join(table_names)})")

    def test_02_rfc4180_escaping(self):
        """驗證 RFC 4180 欄位跳脫規範"""
        # 一般字串無需包裹
        self.assertEqual(format_csv_value("hello"), "hello")
        # 逗號需包裹
        self.assertEqual(format_csv_value("apple,banana"), '"apple,banana"')
        # 引號需轉成雙引號並包裹
        self.assertEqual(format_csv_value('say "hi"'), '"say ""hi"""')
        # 換行符號需包裹
        self.assertEqual(format_csv_value("line1\nline2"), '"line1\nline2"')
        # None 轉為空字串
        self.assertEqual(format_csv_value(None), "")
        print("✔ 測試 2 通過：RFC 4180 逗號、雙引號與換行跳脫驗證完全正確")

    def test_03_utf8_bom_presence(self):
        """驗證匯出字串包含 UTF-8 BOM 與二進制字節"""
        csv_str = export_table_to_csv_string('users')
        self.assertTrue(csv_str.startswith('\ufeff'), "開頭必須包含 UTF-8 BOM 字元")
        
        # 檢查二進制位元組
        bytes_data = csv_str.encode('utf-8')
        self.assertEqual(bytes_data[:3], b'\xef\xbb\xbf', "二進制首 3 bytes 必須為 EF BB BF")
        self.assertIn('\r\n', csv_str, "換行符號必須為 Windows CRLF")
        print("✔ 測試 3 通過：UTF-8 BOM (0xEF 0xBB 0xBF) 與 CRLF 換行結構完全相容 Windows Excel")

    def test_04_api_table_list(self):
        """驗證 /api/export/csv/tables 端點"""
        res = self.client.get('/api/export/csv/tables')
        self.assertEqual(res.status_code, 200)
        json_data = res.get_json()
        self.assertTrue(json_data['success'])
        self.assertGreaterEqual(len(json_data['data']), 3)
        print("✔ 測試 4 通過：/api/export/csv/tables 回傳結構完整")

    def test_05_api_download_stream(self):
        """驗證 /api/export/csv/<table_name> 附件串流下載端點"""
        res = self.client.get('/api/export/csv/users')
        self.assertEqual(res.status_code, 200)
        self.assertIn('text/csv', res.headers.get('Content-Type', ''))
        self.assertIn('attachment; filename=users.csv', res.headers.get('Content-Disposition', ''))
        
        # 檢查回應二進制數據是否包含 BOM
        self.assertTrue(res.data.startswith(b'\xef\xbb\xbf'), "下載串流必須以 UTF-8 BOM 開頭")
        print("✔ 測試 5 通過：/api/export/csv/users 附件下載標頭與二進制串流正確")

    def test_06_api_preview_and_security(self):
        """驗證預覽端點與非法表格防禦"""
        # 正常預覽
        res_prev = self.client.get('/api/export/csv/products/preview')
        self.assertEqual(res_prev.status_code, 200)
        self.assertTrue(len(res_prev.get_json()['data']['preview_lines']) > 0)

        # 惡意表名防禦 (防止 SQL 注入)
        res_bad = self.client.get('/api/export/csv/non_existent_table;DROP TABLE users;')
        self.assertEqual(res_bad.status_code, 404)
        print("✔ 測試 6 通過：CSV 內容預覽與非法資料表存取安全防禦正確")

    def test_07_batch_export_to_disk(self):
        """驗證 /api/export/csv/batch 批次本機寫入"""
        res = self.client.post('/api/export/csv/batch')
        self.assertEqual(res.status_code, 200)
        data = res.get_json()['data']
        self.assertEqual(len(data), 3)
        for item in data:
            self.assertTrue(os.path.exists(item['file_path']))
            self.assertGreater(item['file_size_bytes'], 0)
        print(f"✔ 測試 7 通過：批次匯出成功寫入磁碟 (共 {len(data)} 個檔案)")

if __name__ == '__main__':
    print("\n================== [Phase 3 自動化單元測試開始] ==================")
    unittest.main()
