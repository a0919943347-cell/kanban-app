import React, { useState, useEffect, useMemo } from 'react';

export default function Phase2Dashboard() {
  // 狀態管理
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [batchExporting, setBatchExporting] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // checking | online | offline
  const [kpis, setKpis] = useState({ total_users: 0, total_products: 0, total_orders: 0, total_revenue: 0 });
  const [topSpenders, setTopSpenders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  
  // Phase 3: CSV 匯出相關狀態
  const [exportTables, setExportTables] = useState([]);
  const [previewData, setPreviewData] = useState(null); // { tableName, lines, loading }

  // 三表原始資料
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);

  // 介面互動狀態
  const [activeTab, setActiveTab] = useState('purchases'); // purchases | users | products
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // 載入所有後端 API 資料
  const fetchAllData = async () => {
    try {
      setLoading(true);
      // 1. 檢查健康狀態
      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }

      // 2. 獲取 KPI、分析數據、匯出表清單與三表資料
      const [kpiRes, spendersRes, prodsRes, statusRes, usersRes, pListRes, purRes, tablesRes] = await Promise.all([
        fetch('/api/analytics/kpis').then(r => r.json()),
        fetch('/api/analytics/top-spenders?limit=5').then(r => r.json()),
        fetch('/api/analytics/top-products?limit=5').then(r => r.json()),
        fetch('/api/analytics/status-distribution').then(r => r.json()),
        fetch('/api/users').then(r => r.json()),
        fetch('/api/products').then(r => r.json()),
        fetch('/api/purchases').then(r => r.json()),
        fetch('/api/export/csv/tables').then(r => r.json()).catch(() => ({ success: false })),
      ]);

      if (kpiRes.success) setKpis(kpiRes.data);
      if (spendersRes.success) setTopSpenders(spendersRes.data);
      if (prodsRes.success) setTopProducts(prodsRes.data);
      if (statusRes.success) setStatusDistribution(statusRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (pListRes.success) setProducts(pListRes.data);
      if (purRes.success) setPurchases(purRes.data);
      if (tablesRes.success) setExportTables(tablesRes.data);

    } catch (err) {
      console.error('API 讀取失敗:', err);
      setBackendStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // 觸發 Phase 2 種子資料一鍵重置
  const handleResetSeed = async () => {
    if (seeding) return;
    try {
      setSeeding(true);
      const res = await fetch('/api/seed/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showNotification('success', '🎉 成功重新注入 Phase 2 擬真測試資料（12 會員、14 商品、30 筆交易）！');
        await fetchAllData();
      } else {
        showNotification('error', `重置失敗：${data.error}`);
      }
    } catch (err) {
      showNotification('error', `連線錯誤：${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  // Phase 3: 觸發伺服器端批次匯出所有 CSV
  const handleBatchExport = async () => {
    if (batchExporting) return;
    try {
      setBatchExporting(true);
      const res = await fetch('/api/export/csv/batch', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const fileNames = data.data.map(f => f.file_name).join(', ');
        showNotification('success', `💾 已成功批次輸出至伺服器磁碟：${fileNames} (包含 UTF-8 BOM)`);
      } else {
        showNotification('error', `批次匯出失敗：${data.error}`);
      }
    } catch (err) {
      showNotification('error', `連線異常：${err.message}`);
    } finally {
      setBatchExporting(false);
    }
  };

  // Phase 3: 瀏覽器直接下載單表 CSV
  const handleDirectDownload = (tableName) => {
    window.location.href = `/api/export/csv/${tableName}`;
  };

  // Phase 3: 取得單表 CSV 預覽
  const handlePreviewCsv = async (tableName) => {
    try {
      setPreviewData({ tableName, lines: [], loading: true });
      const res = await fetch(`/api/export/csv/${tableName}/preview`);
      const data = await res.json();
      if (data.success) {
        setPreviewData({
          tableName,
          lines: data.data.preview_lines,
          loading: false
        });
      } else {
        showNotification('error', `無法讀取預覽：${data.error}`);
        setPreviewData(null);
      }
    } catch (err) {
      showNotification('error', `預覽連線錯誤：${err.message}`);
      setPreviewData(null);
    }
  };

  const showNotification = (type, msg) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  // 搜尋過濾
  const filteredPurchases = useMemo(() => {
    if (!searchQuery) return purchases;
    const q = searchQuery.toLowerCase();
    return purchases.filter(p => 
      (p.user_name && p.user_name.toLowerCase().includes(q)) ||
      (p.user_email && p.user_email.toLowerCase().includes(q)) ||
      (p.product_name && p.product_name.toLowerCase().includes(q)) ||
      (p.status && p.status.toLowerCase().includes(q))
    );
  }, [purchases, searchQuery]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  }, [users, searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      p.product_name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  // 狀態徽章樣式渲染
  const renderStatusBadge = (status) => {
    const config = {
      completed: { bg: '#dcfce7', text: '#15803d', border: '#86efac', label: '已完成 (completed)' },
      pending: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d', label: '處理中 (pending)' },
      refunded: { bg: '#ffe4e6', text: '#be123c', border: '#fda4af', label: '已退款 (refunded)' },
      cancelled: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', label: '已取消 (cancelled)' },
    };
    const c = config[status] || { bg: '#f3f4f6', text: '#374151', border: '#d1d5db', label: status };
    return (
      <span style={{
        backgroundColor: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        padding: '3px 9px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-block'
      }}>
        {c.label}
      </span>
    );
  };

  const maxSpent = topSpenders.length > 0 ? topSpenders[0].total_spent : 1;
  const maxSold = topProducts.length > 0 ? topProducts[0].units_sold : 1;

  return (
    <div style={{
      maxWidth: '1240px',
      margin: '0 auto',
      padding: '24px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#0f172a',
      backgroundColor: '#f8fafc',
      minHeight: '100vh'
    }}>
      {/* 頂部通知 Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontWeight: '500',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {notification.msg}
        </div>
      )}

      {/* CSV 預覽彈窗 Modal */}
      {previewData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '840px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '85vh'
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
                  📄 檔案內容即時預覽：<span style={{ color: '#4f46e5' }}>{previewData.tableName}.csv</span>
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  遵循 RFC 4180 標準 • UTF-8 BOM 注入 • 呈現前 15 行
                </span>
              </div>
              <button
                onClick={() => setPreviewData(null)}
                style={{
                  backgroundColor: '#e2e8f0',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ✕ 關閉
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', backgroundColor: '#0f172a', color: '#f8fafc' }}>
              {previewData.loading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>正在讀取 CSV 內容...</div>
              ) : (
                <pre style={{
                  margin: 0,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {previewData.lines.map((line, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ color: '#64748b', userSelect: 'none', width: '28px', textAlign: 'right' }}>
                        {idx + 1}
                      </span>
                      <span style={{ color: idx === 0 ? '#38bdf8' : '#e2e8f0' }}>{line}</span>
                    </div>
                  ))}
                </pre>
              )}
            </div>

            <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => handleDirectDownload(previewData.tableName)}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📥 直接下載此 CSV 檔案
              </button>
              <button
                onClick={() => setPreviewData(null)}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                完成檢視
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 頂部標頭與控制按鈕 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>
              🛒 電商後台與資料管線系統 (Phase 2 & Phase 3)
            </h1>
            <span style={{
              backgroundColor: backendStatus === 'online' ? '#dcfce7' : '#fee2e2',
              color: backendStatus === 'online' ? '#166534' : '#991b1b',
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: backendStatus === 'online' ? '#22c55e' : '#ef4444'
              }}></span>
              {backendStatus === 'online' ? 'Python API 連線正常' : '後端離線或檢查中'}
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            架構：<strong>Python 3.12 (Flask + CSV Pipeline)</strong> 後端 API + <strong>React 18</strong> 互動介面 + <strong>SQLite 3</strong> 資料庫
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleResetSeed}
            disabled={seeding}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: seeding ? 'not-allowed' : 'pointer',
              opacity: seeding ? 0.7 : 1,
              boxShadow: '0 2px 4px rgba(79, 70, 229, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            {seeding ? '⏳ 正在重置並注入資料...' : '🔄 一鍵重置並注入 Phase 2 種子資料'}
          </button>

          <button
            onClick={fetchAllData}
            style={{
              backgroundColor: '#ffffff',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            重整數據
          </button>
        </div>
      </div>

      {/* 頂部 KPI 卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={kpiCardStyle}>
          <div style={kpiTitleStyle}>👥 註冊會員總數 (users)</div>
          <div style={kpiValueStyle}>{kpis.total_users} <span style={kpiUnitStyle}>位</span></div>
        </div>
        <div style={kpiCardStyle}>
          <div style={kpiTitleStyle}>📦 上架商品數量 (products)</div>
          <div style={kpiValueStyle}>{kpis.total_products} <span style={kpiUnitStyle}>款</span></div>
        </div>
        <div style={kpiCardStyle}>
          <div style={kpiTitleStyle}>🛒 購買紀錄總數 (user_products)</div>
          <div style={kpiValueStyle}>{kpis.total_orders} <span style={kpiUnitStyle}>筆</span></div>
        </div>
        <div style={kpiCardStyle}>
          <div style={kpiTitleStyle}>💰 累計完成交易營業額</div>
          <div style={{ ...kpiValueStyle, color: '#059669' }}>
            NT$ {kpis.total_revenue.toLocaleString('zh-TW')}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Phase 3：批次 CSV 匯出與防亂碼管線中心 (CSV Export Pipeline) */}
      {/* ============================================================ */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px 24px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                📦 Phase 3：批次 CSV 匯出與防亂碼管線中心
              </h2>
              <span style={{
                backgroundColor: '#dcfce7',
                color: '#15803d',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                🛡️ UTF-8 BOM 注入 (Excel 相容零亂碼)
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
              由 Python 後端自動探測 SQLite 實體表，一對一產出標準 RFC 4180 CSV 檔案，可直接雙擊在 Windows Excel 正確開啟。
            </p>
          </div>

          <button
            onClick={handleBatchExport}
            disabled={batchExporting}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: batchExporting ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
            }}
          >
            {batchExporting ? '⏳ 正在批次匯出...' : '🚀 一鍵伺服器批次匯出所有 CSV'}
          </button>
        </div>

        {/* 動態表卡片列表 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {exportTables.map((tbl) => (
            <div key={tbl.table_name} style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '1.2rem' }}>📊</span>
                    <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{tbl.table_name}.csv</strong>
                  </div>
                  <span style={{
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    {tbl.row_count} 筆資料
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '12px' }}>
                  欄位清單: <span style={{ fontFamily: 'monospace', color: '#475569' }}>{tbl.columns.join(', ')}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
                <button
                  onClick={() => handlePreviewCsv(tbl.table_name)}
                  style={{
                    flex: 1,
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  👀 線上預覽
                </button>
                <button
                  onClick={() => handleDirectDownload(tbl.table_name)}
                  style={{
                    flex: 1,
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  📥 下載 CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase 2 商業分析排行政區塊 (Business Analytics Panels) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px',
        marginBottom: '28px'
      }}>
        {/* 商業分析 1：VIP 消費榜 Top 5 */}
        <div style={panelCardStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={panelTitleStyle}>🏆 VIP 會員累計消費榜 Top 5</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>以完成訂單計算</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topSpenders.map((u, index) => {
              const rankColor = index === 0 ? '#f59e0b' : index === 1 ? '#64748b' : index === 2 ? '#b45309' : '#94a3b8';
              const percent = Math.round((u.total_spent / maxSpent) * 100);
              return (
                <div key={u.user_id} style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '22px', height: '22px', borderRadius: '50%', backgroundColor: rankColor, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </span>
                      <strong style={{ fontSize: '0.925rem' }}>{u.name}</strong>
                    </div>
                    <span style={{ fontWeight: '700', color: '#059669', fontSize: '0.95rem' }}>
                      NT$ {u.total_spent.toLocaleString('zh-TW')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>
                    <span>{u.email}</span>
                    <span>{u.total_orders} 筆訂單 ({u.total_items} 件商品)</span>
                  </div>
                  {/* 進度條 */}
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#4f46e5', borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 商業分析 2：熱銷商品榜 Top 5 */}
        <div style={panelCardStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={panelTitleStyle}>🔥 商品銷量熱門排行榜 Top 5</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>累計銷售件數</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topProducts.map((p, index) => {
              const percent = Math.round((p.units_sold / maxSold) * 100);
              return (
                <div key={p.product_id} style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#3b82f6', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </span>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{p.product_name}</span>
                    </div>
                    <span style={{ fontWeight: '700', color: '#2563eb', fontSize: '0.9rem' }}>
                      {p.units_sold} 件
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>
                    <span>目前單價: NT$ {p.current_price.toLocaleString('zh-TW')}</span>
                    <span>創造營業額: NT$ {p.total_revenue.toLocaleString('zh-TW')}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: '#0284c7', borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 商業分析 3：訂單狀態分佈 */}
        <div style={panelCardStyle}>
          <div style={panelHeaderStyle}>
            <h3 style={panelTitleStyle}>📊 訂單交易狀態分佈</h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>總計 {kpis.total_orders} 筆</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center', height: 'calc(100% - 40px)' }}>
            {statusDistribution.map(item => {
              const percent = kpis.total_orders > 0 ? Math.round((item.count / kpis.total_orders) * 100) : 0;
              return (
                <div key={item.status} style={{ padding: '12px 14px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>{renderStatusBadge(item.status)}</div>
                    <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1e293b' }}>
                      {item.count} 筆 <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>({percent}%)</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' }}>
                    <span>金額小計</span>
                    <span style={{ fontWeight: '600', color: '#0f172a' }}>NT$ {item.subtotal.toLocaleString('zh-TW')}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${percent}%`,
                      height: '100%',
                      backgroundColor: item.status === 'completed' ? '#10b981' : item.status === 'pending' ? '#f59e0b' : item.status === 'refunded' ? '#ef4444' : '#94a3b8'
                    }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 資料庫三表檢視器 (Tabs + Search) */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* 控制欄 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('purchases')}
              style={activeTab === 'purchases' ? tabActiveStyle : tabInactiveStyle}
            >
              🛒 購買紀錄表 ({filteredPurchases.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              style={activeTab === 'users' ? tabActiveStyle : tabInactiveStyle}
            >
              👥 會員名單 ({filteredUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              style={activeTab === 'products' ? tabActiveStyle : tabInactiveStyle}
            >
              📦 商品目錄 ({filteredProducts.length})
            </button>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 即時搜尋當前表格內容..."
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.875rem',
              outline: 'none',
              width: '260px'
            }}
          />
        </div>

        {/* 表格呈現區 */}
        <div style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>資料加載中...</div>
          ) : (
            <>
              {/* Tab 1: user_products */}
              {activeTab === 'purchases' && (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>ID</th>
                      <th style={thStyle}>購買會員</th>
                      <th style={thStyle}>購買商品</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>數量</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>成交單價 (快照)</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>小計金額</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>訂單狀態</th>
                      <th style={thStyle}>購買時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPurchases.map(p => (
                      <tr key={p.id} style={trStyle}>
                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 'bold' }}>{p.id}</td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: '600' }}>{p.user_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>user_id: {p.user_id} | {p.user_email}</div>
                        </td>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: '600' }}>{p.product_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>product_id: {p.product_id}</div>
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold' }}>{p.quantity}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace' }}>NT$ {p.purchase_price.toLocaleString('zh-TW')}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: '#059669' }}>
                          NT$ {p.subtotal.toLocaleString('zh-TW')}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>{renderStatusBadge(p.status)}</td>
                        <td style={{ ...tdStyle, fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>{p.purchased_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Tab 2: users */}
              {activeTab === 'users' && (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>ID</th>
                      <th style={thStyle}>會員姓名</th>
                      <th style={thStyle}>電子信箱 (Email)</th>
                      <th style={thStyle}>聯絡電話</th>
                      <th style={thStyle}>註冊時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} style={trStyle}>
                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 'bold' }}>{u.id}</td>
                        <td style={{ ...tdStyle, fontWeight: '600' }}>{u.name}</td>
                        <td style={{ ...tdStyle, color: '#4f46e5' }}>{u.email}</td>
                        <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{u.phone || '—'}</td>
                        <td style={{ ...tdStyle, fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>{u.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Tab 3: products */}
              {activeTab === 'products' && (
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>ID</th>
                      <th style={thStyle}>商品名稱</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>單價</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>現有庫存</th>
                      <th style={thStyle}>規格描述</th>
                      <th style={thStyle}>上架時間</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => (
                      <tr key={p.id} style={trStyle}>
                        <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 'bold' }}>{p.id}</td>
                        <td style={{ ...tdStyle, fontWeight: '600' }}>{p.product_name}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: '#059669' }}>
                          NT$ {p.price.toLocaleString('zh-TW')}
                        </td>
                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            backgroundColor: p.stock <= 10 ? '#fee2e2' : '#f1f5f9',
                            color: p.stock <= 10 ? '#b91c1c' : '#334155'
                          }}>
                            {p.stock} 件
                          </span>
                        </td>
                        <td style={{ ...tdStyle, fontSize: '0.85rem', color: '#475569', maxWidth: '300px' }}>{p.description || '—'}</td>
                        <td style={{ ...tdStyle, fontSize: '0.8rem', color: '#64748b', fontFamily: 'monospace' }}>{p.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 樣式物件
const kpiCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '10px',
  padding: '18px 20px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
};

const kpiTitleStyle = {
  fontSize: '0.85rem',
  color: '#64748b',
  fontWeight: '600',
  marginBottom: '6px'
};

const kpiValueStyle = {
  fontSize: '1.75rem',
  fontWeight: '800',
  fontFamily: 'monospace',
  color: '#0f172a'
};

const kpiUnitStyle = {
  fontSize: '0.9rem',
  fontWeight: 'normal',
  color: '#64748b'
};

const panelCardStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};

const panelHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',
  marginBottom: '16px',
  borderBottom: '1px solid #f1f5f9',
  paddingBottom: '10px'
};

const panelTitleStyle = {
  margin: 0,
  fontSize: '1.05rem',
  fontWeight: '700',
  color: '#1e293b'
};

const tabActiveStyle = {
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow: '0 1px 3px rgba(79, 70, 229, 0.3)'
};

const tabInactiveStyle = {
  backgroundColor: 'transparent',
  color: '#64748b',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontWeight: '600',
  cursor: 'pointer'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: '0.875rem'
};

const thStyle = {
  backgroundColor: '#f8fafc',
  color: '#475569',
  padding: '12px 16px',
  fontSize: '0.75rem',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  borderBottom: '1px solid #e2e8f0'
};

const tdStyle = {
  padding: '12px 16px',
  borderBottom: '1px solid #f1f5f9'
};

const trStyle = {
  transition: 'background-color 0.15s'
};
