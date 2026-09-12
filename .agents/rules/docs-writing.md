# 文件撰寫與維護規範 (Documentation Writing Rules)

本規則適用於本專案所有技術規格、需求文件 (PRD)、功能規格 (Spec)、任務追蹤 (TODO) 與開發手冊之撰寫與維護。

---

## 1. 語言與用詞標準 (Language & Tone)
* **主要語言**：以**繁體中文 (Traditional Chinese, zh-TW)** 為主。
* **專有名詞與技術術語**：保持標準英文慣用語（如 `API`, `PRD`, `localStorage`, `Git`, `Commit`, `Component`, `Database`），不強行音譯或直譯。
* **語氣與風格**：客觀、專業、結構清晰、言簡意賅，避免主觀模糊或過度冗長的敘述。

---

## 2. 排版與 Markdown 規範 (Formatting & Structure)
* **語法標準**：嚴格遵循 GitHub Flavored Markdown (GFM) 格式。
* **標題層級**：
  * 文件頂部僅使用單一 H1 (`#`) 作為文件主標題。
  * 主要章節使用 H2 (`##`)，子章節依序使用 H3 (`###`)、H4 (`####`)，嚴禁跳級使用標題。
* **視覺強調與提示區塊**：
  * 關鍵注意事項、風險或重要前置條件，使用 GitHub Alerts 格式：
    > [!NOTE] 相關背景資訊或實作細節說明
    > [!TIP] 最佳實踐、優化建議或開發技巧
    > [!IMPORTANT] 核心要求、關鍵步驟或必須遵守的準則
    > [!WARNING] 潛在問題、破壞性變更 (Breaking Changes) 或相容性提醒
* **圖表視覺化**：
  * 系統架構、相依性流程、狀態轉移圖優先使用 `mermaid` 流程圖代碼區塊呈現。

---

## 3. 規格完整度與一致性 (SSOT & Integrity)
* **單一事實來源 (Single Source of Truth, SSOT)**：
  * 當業務需求或功能架構發生變更時，必須同步審查並更新關聯文件（例如 PRD、Spec 與 TODO 任務清單），嚴禁規格與程式碼脫節。
* **文件版本資訊表**：
  * 規格書或架構文件頂部應附帶元資訊表格，包含：`文件版本`、`最後更新日期`、`關聯文件`、`狀態`（Draft / In Review / Approved）。
* **保留現有脈絡**：
  * 增修既有文件時，應維護既有架構與章節完整性，不可未經確認逕自刪除原有歷程或重要說明。

---

## 4. 程式碼與 API 規格要求 (Code & API Docs)
* **程式碼區塊**：所有程式碼與設定範例皆須清楚宣告語言類型（如 ```json, ```javascript, ```python, ```sql, ```bash）。
* **API 規範說明**：
  * 必須清楚標明 HTTP Method（GET, POST, PUT, DELETE）、端點路徑（Path）與權限需求。
  * 必須提供完整的 Request 欄位格式說明、範例 Payload，以及 Response 狀態碼與回應範例。
