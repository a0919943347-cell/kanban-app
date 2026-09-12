import sys
import os

# 確保可引用同目錄模組
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from db import get_connection, init_schema, get_kpis, get_top_spenders, get_top_products, get_status_distribution

def run_seed():
    """執行 Phase 2 擬真情境測試資料注入"""
    print("[1] 正在重置資料庫結構...")
    init_schema()

    conn = get_connection()
    cursor = conn.cursor()

    # 1. 會員測試資料 (12 位)
    users = [
        ('alice.chen@example.com', '陳雅婷 (Alice)', '0912-345-678', '2026-01-10 09:20:00'),
        ('bob.lin@example.com', '林志豪 (Bob)', '0923-456-789', '2026-01-15 14:11:00'),
        ('charlie.wang@example.com', '王大衛 (Charlie)', '0934-567-890', '2026-01-22 18:30:00'),
        ('david.kuo@example.com', '郭家維 (David)', '0955-123-456', '2026-02-01 11:05:00'),
        ('emily.huang@example.com', '黃羽萱 (Emily)', '0966-234-567', '2026-02-05 16:42:00'),
        ('frank.liu@example.com', '劉柏翰 (Frank)', '0977-345-678', '2026-02-12 10:15:00'),
        ('grace.chang@example.com', '張庭瑄 (Grace)', '0988-456-789', '2026-02-18 20:01:00'),
        ('henry.wu@example.com', '吳冠宇 (Henry)', '0910-567-890', '2026-02-25 13:50:00'),
        ('iris.yang@example.com', '楊佳蓉 (Iris)', '0920-678-901', '2026-03-01 08:33:00'),
        ('jack.chen@example.com', '陳俊傑 (Jack)', '0930-789-012', '2026-03-02 12:20:00'),
        ('kelly.lai@example.com', '賴曉玲 (Kelly)', '0940-890-123', '2026-03-03 17:45:00'),
        ('leo.tsai@example.com', '蔡宗翰 (Leo)', '0950-901-234', '2026-03-04 19:10:00')
    ]
    cursor.executemany(
        "INSERT INTO users (email, name, phone, created_at) VALUES (?, ?, ?, ?)",
        users
    )

    # 2. 商品測試資料 (14 款)
    products = [
        ('iPhone 16 Pro 256GB', 36900, 'Apple 原廠旗艦機，鈦金屬邊框與 48MP 鏡頭', 15),
        ('AirPods Pro 2 (USB-C)', 7490, '主動降噪耳機，適應性音訊與長效續航', 40),
        ('MacBook Air 15吋 M3', 42900, '極致輕薄筆電，16GB 統一記憶體 / 512GB SSD', 10),
        ('USB-C 編織快速充電線 2M', 590, '最高支援 100W PD 快充，耐折抗磨損', 120),
        ('極簡人體工學透氣網椅', 8990, '全椅透氣網布，四段自適應腰靠支撐', 8),
        ('GaN 氮化鎵 65W 三孔快充頭', 1190, '支援 2C1A 同時輸出，體積小巧好攜帶', 75),
        ('三模機械式 RGB 鍵盤 (茶軸)', 3280, '支援藍牙/2.4G/有線三模，PBT 熱昇華鍵帽', 25),
        ('人體工學靜音垂直滑鼠', 1580, '57度握角減輕手腕負擔，支援跨裝置切換', 35),
        ('27吋 4K HDR 專業設計螢幕', 14900, 'IPS面板 99% sRGB，支援 USB-C 90W 反向供電', 6),
        ('雙層不銹鋼陶瓷易潔保溫杯 500ml', 780, '內膽陶瓷易潔層，不卡咖啡與茶垢', 50),
        ('精品中深焙濾掛咖啡組 (20入)', 620, '帶有黑巧克力與堅果香氣，手工挑豆烘焙', 60),
        ('日系抗藍光平光護眼鏡', 1280, '超輕鈦金屬鏡架，有效濾除40%有害藍光', 30),
        ('高階降噪耳罩式無線耳機', 9900, '業界頂級主動降噪，30小時超長續航力', 12),
        ('防潑水商務機能電腦後背包', 2180, '可容納 16 吋筆電，具備獨立乾濕分離層', 28)
    ]
    cursor.executemany(
        "INSERT INTO products (product_name, price, description, stock) VALUES (?, ?, ?, ?)",
        products
    )

    # 3. 購買紀錄測試資料 (30 筆真實消費紀錄)
    purchases = [
        # Alice (user_id: 1)
        (1, 1, 1, 36900, 'completed', '2026-02-01 10:30:00'),
        (1, 4, 2, 590,   'completed', '2026-02-01 10:30:00'),
        (1, 2, 1, 6990,  'completed', '2026-02-14 19:15:00'),
        (1, 10, 1, 780,  'completed', '2026-02-28 12:00:00'),

        # Bob (user_id: 2)
        (2, 5, 1, 8990,  'completed', '2026-02-10 14:20:00'),
        (2, 7, 1, 3280,  'completed', '2026-02-10 14:20:00'),
        (2, 8, 1, 1580,  'completed', '2026-02-10 14:20:00'),
        (2, 9, 1, 14900, 'completed', '2026-02-18 09:40:00'),

        # Charlie (user_id: 3)
        (3, 3, 1, 42900, 'completed', '2026-02-05 11:25:00'),
        (3, 6, 1, 1190,  'completed', '2026-02-05 11:25:00'),
        (3, 14, 1, 2180, 'completed', '2026-02-05 11:25:00'),

        # David (user_id: 4)
        (4, 13, 1, 9900, 'completed', '2026-02-15 16:30:00'),
        (4, 11, 2, 620,  'completed', '2026-02-20 08:15:00'),
        (4, 4, 1, 590,   'refunded',  '2026-02-22 17:00:00'),

        # Emily (user_id: 5)
        (5, 10, 2, 780,  'completed', '2026-02-12 13:10:00'),
        (5, 11, 3, 600,  'completed', '2026-02-12 13:10:00'),
        (5, 12, 1, 1280, 'completed', '2026-03-01 20:45:00'),

        # Frank (user_id: 6)
        (6, 6, 2, 1190,  'completed', '2026-02-25 15:00:00'),
        (6, 4, 3, 590,   'completed', '2026-02-25 15:00:00'),

        # Grace (user_id: 7)
        (7, 2, 1, 7490,  'completed', '2026-02-26 18:20:00'),
        (7, 8, 1, 1580,  'completed', '2026-02-26 18:20:00'),
        (7, 12, 1, 1280, 'pending',   '2026-03-05 09:10:00'),

        # Henry (user_id: 8)
        (8, 7, 1, 3280,  'completed', '2026-03-01 10:05:00'),
        (8, 4, 1, 590,   'cancelled', '2026-03-02 11:30:00'),

        # Iris (user_id: 9)
        (9, 1, 1, 36900, 'completed', '2026-03-02 14:00:00'),
        (9, 2, 1, 7490,  'completed', '2026-03-02 14:00:00'),

        # Jack (user_id: 10)
        (10, 14, 1, 2180, 'completed', '2026-03-03 16:20:00'),
        (10, 6, 1, 1190,  'completed', '2026-03-03 16:20:00'),

        # Kelly (user_id: 11)
        (11, 10, 1, 780, 'pending',   '2026-03-05 08:30:00'),
        (11, 11, 1, 620, 'pending',   '2026-03-05 08:30:00')
    ]
    cursor.executemany(
        "INSERT INTO user_products (user_id, product_id, quantity, purchase_price, status, purchased_at) VALUES (?, ?, ?, ?, ?, ?)",
        purchases
    )

    conn.commit()
    conn.close()

    print(f"[2] 成功寫入：{len(users)} 位會員、{len(products)} 款商品、{len(purchases)} 筆交易！")
    return {
        "users_count": len(users),
        "products_count": len(products),
        "purchases_count": len(purchases)
    }

if __name__ == '__main__':
    run_seed()
    kpis = get_kpis()
    print("KPIs:", kpis)
    print("Top Spenders:", get_top_spenders(3))
