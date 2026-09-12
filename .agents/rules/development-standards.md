# 專案開發規範 (Development Standards & Guidelines)

本規範依據本專案「簡約暖色任務看板」的現有架構、程式碼風格與技術選型制定，旨在確保所有後續功能擴充、重構與維護工作均具備高度一致性、效能與可靠度。

---

## 1. 架構原則與技術哲學 (Core Philosophy)

* **原生極簡，零外部依賴 (Zero Dependencies)**：
  * 專案核心嚴格採用純前端原生技術（Vanilla HTML5 / CSS3 / ES6+ JavaScript），不引入非必要的打包工具、編譯器或龐大框架（如 React, Vue, jQuery 等）。
* **狀態驅動渲染 (State-Driven Rendering)**：
  * 遵循單向資料流邏輯：`使用者互動 -> 更新記憶體 State (tasks 陣列) -> saveTasks() 持久化 -> render() 重新繪製視圖`。
  * 嚴禁在未同步更新 `tasks` 陣列狀態的情況下，直接透過 DOM 操作單獨修改視圖內容。
* **資料相容性與防禦性設計 (Backward Compatibility)**：
  * 讀取本機 `localStorage` 時，必須包含舊版本結構遷移（Data Migration）與防禦性欄位預設值（例如缺少 `priority` 時預設為 `medium`，缺少 `dueDate` 時設為 `null`），確保舊用戶無痛升級。

---

## 2. 狀態與資料模型規範 (Data Model Standards)

任務物件（Task Object）是本系統的核心資料實體，其資料結構定義如下：

```javascript
/**
 * @typedef {Object} Task
 * @property {string} id - 唯一識別碼 (crypto.randomUUID() 或時間戳隨機字串)
 * @property {string} text - 任務內容描述 (純文字，長度 <= 100 字元)
 * @property {'work'|'life'} category - 任務分類 (工作 / 生活)
 * @property {'high'|'medium'|'low'} priority - 任務優先度
 * @property {'todo'|'process'|'done'} status - 當前所屬看板欄位
 * @property {string|null} dueDate - 截止日期 (ISO 格式 'YYYY-MM-DD' 或 null)
 * @property {number} createdAt - 建立時間戳記 (Date.now())
 */
```

### 資料處理準則：
1. **新增任務**：預設進入 `todo` 欄位，並置於陣列最前端 (`tasks.unshift()`)。
2. **優先度排序**：渲染時卡片需按 `High (weight: 3) > Medium (weight: 2) > Low (weight: 1)` 權重降冪排列，相同優先度則依建立時間降冪排序。
3. **日期格式與判定**：
   * 儲存格式統一為 `YYYY-MM-DD`。
   * 顯示格式統一為 `YYYY/MM/DD`。
   * 判定過期邏輯：`task.dueDate <= todayStr`（以使用者本地日期 `YYYY-MM-DD` 為準）。

---

## 3. JavaScript 程式碼規範 (JavaScript Guidelines)

* **範疇封裝 (Scope Encapsulation)**：
  * 所有代碼必須封裝於 IIFE（立即執行函式）內部，並嚴格啟用 `'use strict';`，杜絕全域變數汙染。
  ```javascript
  (function () {
    'use strict';
    // 模組內部私有邏輯
  })();
  ```
* **DOM 操作與快取 (DOM Caching)**：
  * 頻繁使用的常駐元素（表單、計數器、欄位容器等）應於初始化時一次性快取，避免在迴圈或高頻函式中重複執行 `document.getElementById`。
* **事件處理：全面採用事件委派 (Event Delegation)**：
  * 跨欄拖曳、卡片刪除、狀態快速切換等按鈕，必須綁定於父層容器（如 `.kanban-board`），透過 `e.target.closest()` 偵測操作目標，避免為每張卡片個別綁定監聽器造成記憶體洩漏。
* **安全規範 (XSS Defense)**：
  * 凡是使用者輸入的文字（如 `task.text`），在拼接產生 HTML 模板字串時，**必須**經過 `escapeHtml()` 跳脫處理：
  ```javascript
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  ```

---

## 4. CSS 與視覺設計系統規範 (CSS & Design System)

* **設計代幣 (Design Tokens) 一致性**：
  * 嚴格禁止在樣式規則中直接寫死 Hex 色碼或隨機尺寸，所有色彩、間距、圓角與陰影必須引用 `:root` 定義的 CSS 變數：
    * 頁面底色：`var(--bg-page)` (`#faf7f2`)
    * 欄位底色：`var(--bg-column)` (`#f6f1eb`)
    * 主題暖陶土色：`var(--accent-primary)` (`#c26d43`)
    * 文字階層：`var(--text-primary)`, `var(--text-secondary)`, `var(--text-muted)`
    * 警示與到期色：`#fee2e2` (底色) / `#dc2626` (文字與邊框)
* **類別命名慣例 (BEM-like Kebab-case)**：
  * 採用清楚具語意的連字號命名法：
    * 結構元件：`.kanban-board`, `.kanban-column`, `.task-card`
    * 狀態與標記：`.due-date-badge.overdue`, `.task-card.dragging`
    * 按鈕元件：`.btn-add`, `.btn-stage`, `.btn-card-action`
* **響應式佈局原則 (Responsive Design)**：
  * 採用 Flexbox 與 CSS Grid 混合排版。
  * 桌面版預設三欄並列平鋪；行動裝置 (`@media (max-width: 768px)`) 自動轉換為自適應寬度，支援觸控滑動。

---

## 5. HTML 與無障礙規範 (HTML & Accessibility)

* **語意化標籤**：
  * 頁面主要結構使用 `<header>`, `<main>`, `<section>`, `<nav>`, `<form>`。
* **無障礙支援 (A11y)**：
  * 圖示型按鈕（如刪除、拖曳手柄）必須提供 `aria-label` 或 `title` 屬性。
  * 表單輸入控制元件需配置對應的 `<label for="...">` 或明確的 `placeholder`。
  * 卡片需配置 `tabindex="0"`，以確保鍵盤可定位性。

---

## 6. Git 協作與提交規範 (Git Workflow)

* **Commit Message 必須遵循 Conventional Commits 格式**：
  * `feat: ` 新增功能（例如：新增截止日期欄位）
  * `fix: ` 修復 Bug 或調整路徑設定
  * `docs: ` 文件修訂（README, Rules, PRD）
  * `style: ` 樣式調整（色彩、間距、排版，不影響程式邏輯）
  * `refactor: ` 程式碼重構（既無新功能亦無 Bug 修復）
* **分支與發布管理**：
  * `main` 分支：主開發分支，維護可隨時運行的最新原始碼。
  * `gh-pages` 分支：靜態發布分支，對應 GitHub Pages 雲端線上網址。
