import unittest
import sys
import os

# 加入 backend 路徑
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db import get_kpis, get_top_spenders, get_top_products, get_status_distribution
from seed import run_seed
from app import app

class TestPhase2(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n================== [Phase 2 自動化單元測試開始] ==================")
        # 執行種子資料注入
        seed_result = run_seed()
        print(f"種子資料注入結果: {seed_result}")

    def setUp(self):
        self.client = app.test_client()

    def test_01_seed_counts(self):
        """驗證 Phase 2 種子資料筆數"""
        kpis = get_kpis()
        self.assertEqual(kpis['total_users'], 12, "會員總數應為 12")
        self.assertEqual(kpis['total_products'], 14, "商品總數應為 14")
        self.assertEqual(kpis['total_orders'], 30, "訂單總數應為 30")
        self.assertGreater(kpis['total_revenue'], 200000, "累計完成營收應大於 20 萬")
        print("✔ 測試 1 通過：種子資料筆數與總營收核算正確")

    def test_02_top_spenders_ranking(self):
        """驗證 Phase 2 VIP 消費者排行榜 Top 5"""
        top_spenders = get_top_spenders(5)
        self.assertEqual(len(top_spenders), 5, "排行榜應有 5 位會員")
        
        # Charlie 應為第一名，金額 46,270
        first_place = top_spenders[0]
        self.assertIn("Charlie", first_place['name'])
        self.assertEqual(first_place['total_spent'], 46270.0)
        self.assertEqual(first_place['total_orders'], 3)
        print(f"✔ 測試 2 通過：VIP 第一名為 {first_place['name']}，金額 NT$ {first_place['total_spent']:,.0f}")

    def test_03_top_products_ranking(self):
        """驗證 Phase 2 商品熱銷排行榜 Top 5"""
        top_products = get_top_products(5)
        self.assertEqual(len(top_products), 5, "熱銷榜應有 5 項商品")

        # 銷量第一名應為濾掛咖啡組 (5件)
        first_prod = top_products[0]
        self.assertIn("咖啡", first_prod['product_name'])
        self.assertEqual(first_prod['units_sold'], 5)
        print(f"✔ 測試 3 通過：熱銷冠軍為 {first_prod['product_name']}，售出 {first_prod['units_sold']} 件")

    def test_04_status_distribution(self):
        """驗證 Phase 2 訂單交易狀態分佈"""
        dist = {item['status']: item['count'] for item in get_status_distribution()}
        self.assertEqual(dist.get('completed'), 25, "completed 應為 25 筆")
        self.assertEqual(dist.get('pending'), 3, "pending 應為 3 筆")
        self.assertEqual(dist.get('refunded'), 1, "refunded 應為 1 筆")
        self.assertEqual(dist.get('cancelled'), 1, "cancelled 應為 1 筆")
        print(f"✔ 測試 4 通過：四種訂單狀態筆數分佈精確吻合 ({dist})")

    def test_05_api_endpoints(self):
        """驗證 Flask RESTful API 各分析端點"""
        res = self.client.get('/api/analytics/kpis')
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.get_json()['success'])

        res_spenders = self.client.get('/api/analytics/top-spenders?limit=3')
        self.assertEqual(res_spenders.status_code, 200)
        self.assertEqual(len(res_spenders.get_json()['data']), 3)

        res_products = self.client.get('/api/analytics/top-products?limit=3')
        self.assertEqual(res_products.status_code, 200)
        self.assertEqual(len(res_products.get_json()['data']), 3)

        res_health = self.client.get('/api/health')
        self.assertEqual(res_health.status_code, 200)
        self.assertEqual(res_health.get_json()['status'], 'online')
        print("✔ 測試 5 通過：Flask API 分析端點回傳皆為 200 OK 且資料結構吻合")

if __name__ == '__main__':
    unittest.main()
