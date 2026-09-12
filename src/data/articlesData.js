export const articlesData = [
  {
    id: "rag-enterprise-architecture",
    title: "企業級 RAG 系統落地的五大深水區：從 Naive RAG 到進階 Hybrid Search 與 Reranking",
    category: "RAG 技術",
    date: "2026-08-25",
    readTime: "7 分鐘閱讀",
    coverTag: "RAG & Vector DB",
    summary: "許多企業在導入基礎檢索增強生成 (Naive RAG) 時常面臨召回率低、幻覺與上下文斷裂問題。本文深入探討進階檢索策略：混合檢索 (Hybrid Search)、重新排序 (Reranking) 與動態切片優化。",
    tags: ["RAG", "向量資料庫", "Embedding", "Hybrid Search", "企業落地"],
    content: [
      {
        type: "lead",
        text: "生成式 AI 在企業知識庫的應用中，RAG (Retrieval-Augmented Generation) 已成為標準架構。然而從原型展示 (PoC) 到真實生產環境，往往隔著難以跨越的「召回率」與「回答精準度」深水區。"
      },
      {
        type: "heading",
        text: "一、為什麼傳統 Naive RAG 無法滿足企業需求？"
      },
      {
        type: "paragraph",
        text: "最基礎的 Naive RAG 流程相當簡單：切分文字塊 (Chunking) ➔ 計算向量 (Embedding) ➔ 存入向量庫 ➔ 餘弦相似度查詢 Top-K ➔ 餵入 LLM 生成答案。但在實際企業文檔中，這個流程面臨三大致命瓶頸："
      },
      {
        type: "list",
        items: [
          "語義鴻溝與關鍵字遺失：純向量搜尋對專有名詞、編號（如「規格表第 ISO-27001-B」）敏感度低，容易被向量泛化抹平特異性。",
          "Chunk 切片截斷上下文：固定長度切分常將完整表格、因果邏輯截斷在不同切片中，導致檢索到的片段殘缺不全。",
          "檢索噪聲干擾 LLM 注意力：Top-K 中若有 2 篇是不相關內容，會大幅降低 LLM 抓取正確答案的概率，甚至觸發幻覺。"
        ]
      },
      {
        type: "heading",
        text: "二、解方一：混合檢索 (Hybrid Search: Dense + Sparse)"
      },
      {
        type: "paragraph",
        text: "在現代企業架構中，最佳實踐是將密集向量檢索 (Dense Retrieval) 與稀疏關鍵字檢索 (Sparse Retrieval，如 BM25) 相結合。向量負責捕捉高階語義同義概念，而 BM25 則精準鎖定特定專案代碼、料號與法令條款。透過倒數排名融合 (Reciprocal Rank Fusion, RRF)，能兼顧意圖理解與關鍵字精確性。"
      },
      {
        type: "heading",
        text: "三、解方二：引進 Reranker 模型進行二次過濾"
      },
      {
        type: "paragraph",
        text: "初篩階段以高效能為優先，檢索出 30 到 50 個候選片段；接著透過 Cross-Encoder 架構的重排序模型（例如 Cohere Rerank 或 BGE-Reranker），計算查詢與候選文檔的全交叉注意力得分，挑選出最相關的 Top-3 到 Top-5 片段給 LLM。實測能將企業問答命中率由 62% 大幅推升至 91% 以上。"
      },
      {
        type: "heading",
        text: "四、結語與產品落地建議"
      },
      {
        type: "paragraph",
        text: "建構 RAG 產品不只是串接 OpenAI 與 Pinecone，更重要的是建立端到端的評估指標（如 Ragas、Ares 評估上下文相關性與忠實度）。先做好文檔清理與切片策略，才是打造高品質 AI 智庫的穩健之道。"
      }
    ]
  },
  {
    id: "prompt-engineering-mastery",
    title: "現代提示工程指南：從 Few-shot、思維鏈 (CoT) 到結構化輸出 (Structured Outputs)",
    category: "提示工程",
    date: "2026-08-18",
    readTime: "6 分鐘閱讀",
    coverTag: "Prompt Engineering",
    summary: "Prompt 不僅是與 AI 聊天的問話技巧，更是微調軟體輸出確定性的關鍵工程。本文解析現代提示架構：Few-shot、Chain-of-Thought (CoT)、系統提示詞設定與 JSON Schema 結構化輸出保障。",
    tags: ["Prompt", "CoT", "Structured Outputs", "LLM API", "軟體工程"],
    content: [
      {
        type: "lead",
        text: "在許多人眼中，Prompt Engineering 好像只是在打字框輸入好言好語。但對於工程師與產品經理而言，提示工程實際上是一門「引導模型注意力分佈、壓制非確定性」的嚴謹軟體工程學科。"
      },
      {
        type: "heading",
        text: "一、Zero-shot 到 Few-shot 的昇華"
      },
      {
        type: "paragraph",
        text: "許多人習慣直接給模型指令（Zero-shot），但在面對複雜的企業格式要求或邊界案例 (Edge Cases) 時，提供 2-3 個經典的範例（Few-shot Examples）能降低模型理解分歧高達 70%。範例中應當包含輸入、思考過程與預期輸出格式。"
      },
      {
        type: "heading",
        text: "二、思維鏈 (Chain-of-Thought) 的威力"
      },
      {
        type: "paragraph",
        text: "透過指示模型「在給出最終答案前，請一步步推導你的邏輯思考過程 (Let's think step by step)」，可將隱性推論轉化為多步驟的自回歸計算。這不僅讓數學、邏輯推理題的準確率成倍提升，更為後續的排錯 (Debugging) 提供了完整的可解釋性日誌。"
      },
      {
        type: "heading",
        text: "三、結構化輸出 (Structured Outputs) 與 JSON Schema"
      },
      {
        type: "paragraph",
        text: "在後端系統串接中，最怕 LLM 輸出無法解析的 Markdown、多餘文字或破損的 JSON。現代 LLM 廠商（如 OpenAI、Anthropic、Google Gemini）皆已推出語法級保證的 Structured Outputs。透過 Pydantic 或 Zod 定義 Schema，由模型在 Token 生成層級透過 Constrained Decoding 保證輸出 100% 符合 JSON 規範，徹底消除了正則表達式或解析失敗的惡夢。"
      },
      {
        type: "heading",
        text: "四、提示詞版本管理與回歸測試"
      },
      {
        type: "paragraph",
        text: "將 Prompt 視為原始碼的一部分，存入 Git 並納入 CI/CD 流程。每次修改 Prompt 都必須在測試集上跑動評估指標，確保修復一個邊界案例的同時，不會意外破壞原有 95% 的穩定產出。"
      }
    ]
  },
  {
    id: "vibe-coding-revolution",
    title: "Vibe Coding 興起：當 AI 接管語法細節，工程師如何轉變為「軟體架構指揮家」？",
    category: "開發哲學",
    date: "2026-08-10",
    readTime: "5 分鐘閱讀",
    coverTag: "Vibe Coding & Paradigm Shift",
    summary: "特斯拉前 AI 總監 Andrej Karpathy 提出的『Vibe Coding』正在掀起軟體開發革命。不再逐字鍵入語法，而是以直覺、自然語言與 AI 協同創作。我們該如何掌握這股浪潮？",
    tags: ["Vibe Coding", "AI 輔助開發", "軟體工程演進", "敏捷開發", "創新思維"],
    content: [
      {
        type: "lead",
        text: "2025-2026 年最具震撼性的開發概念莫過於『Vibe Coding』。當高階 AI Agent（如 Claude Code、Cursor、Gemini CLI）能瞬間生成數百行健壯的程式碼，傳統工程師的核心價值究竟發生了什麼位移？"
      },
      {
        type: "heading",
        text: "一、什麼是 Vibe Coding？"
      },
      {
        type: "paragraph",
        text: "Vibe Coding 指的是開發者不再將注意力耗費在手動拼寫 API 語法、記憶 CSS 屬性名或配置繁瑣的 Build Tool，而是依靠對系統全貌的感覺 (Vibe)、清晰的產品規格描述與即時驗證，指揮 AI 代理人像交響樂團般分工完成系統搭建。"
      },
      {
        type: "heading",
        text: "二、從「打字員」到「指揮家」的思維轉變"
      },
      {
        type: "paragraph",
        text: "在 Vibe Coding 模式下，有三個核心技能變得前所未有地重要："
      },
      {
        type: "list",
        items: [
          "精準的抽象能力與架構直覺：知道把系統切成哪幾個模組，清晰界定各模組的職責邊界 (Separation of Concerns)。",
          "敏銳的 Smell-Testing 與驗證能力：能快速察覺 AI 寫出的代碼是否有效能隱患、安全性漏洞或邏輯漏洞。",
          "領域商業知識 (Domain Expertise)：寫出好代碼的門檻被拉低，真正決定勝負的是『解決什麼問題』與『使用者真實體驗』。"
        ]
      },
      {
        type: "heading",
        text: "三、Vibe Coding 的危險陷阱"
      },
      {
        type: "paragraph",
        text: "盲目的 Vibe Coding 容易產生龐大卻難以維護的「義大利麵技術債」。因此，建立嚴格的自動化測試套件 (Automated Test Suites) 與模組化規格，是自由享受 Vibe Coding 速度感的唯一安全帶。"
      }
    ]
  },
  {
    id: "ai-agent-rpa-integration",
    title: "傳統 RPA 走向終局？結合 LLM Agent 的次世代「AI 智慧流程自動化」全面解析",
    category: "RPA & 自動化",
    date: "2026-07-30",
    readTime: "8 分鐘閱讀",
    coverTag: "Agentic RPA",
    summary: "傳統 RPA (如 UiPath) 依賴死板的 UI 選擇器與硬編碼邏輯，按鈕一換位置就崩潰。結合 LLM 的 Agentic RPA 具備動態視覺理解與自我修復能力，正全面重塑企業自動化流程。",
    tags: ["RPA", "AI Agent", "工作流自動化", "電腦視覺", "數位轉型"],
    content: [
      {
        type: "lead",
        text: "過去十年間，企業投入數億資金部署傳統機器人流程自動化 (RPA)，以模擬人工點擊和複製貼上。然而維護這些腳本的成本卻極高——任何網頁改版、彈跳視窗或異常狀況，都會造成工作流直接中斷。"
      },
      {
        type: "heading",
        text: "一、傳統 RPA 的三大死穴"
      },
      {
        type: "list",
        items: [
          "脆性極高 (Brittle)：依賴 XPath 或固定螢幕坐標，界面稍有像素級偏移即報錯。",
          "無法處理非結構化數據：無法直接解讀格式混亂的 PDF 採購單、客戶手寫發票或雜亂電子郵件。",
          "缺乏推理與自適應路徑：一旦遇到流程外彈窗（如驗證碼、維護公告），無人值守機器人只能卡死。"
        ]
      },
      {
        type: "heading",
        text: "二、Agentic RPA 的技術突破"
      },
      {
        type: "paragraph",
        text: "次世代 Agentic RPA 將多模態大模型 (Vision-Language Models) 作為眼睛與大腦。機器人不再死記坐標，而是像人類一樣即時觀察螢幕：『找到確認結帳按鈕並點擊』。即使按鈕從藍色變成綠色、位置從左邊移到右邊，Agent 依然能精準定位。"
      },
      {
        type: "heading",
        text: "三、自主錯誤修復 (Self-Healing Workflows)"
      },
      {
        type: "paragraph",
        text: "當操作發生異常時，Agent 會截圖當前畫面，比對預期目標並進行推理：『發現系統彈出限時促銷視窗，先點選右上角關閉，再繼續原發票登錄流程』。這使端到端自動化的無人值守成功率從 75% 躍升至 97% 以上。"
      },
      {
        type: "heading",
        text: "四、企業導入步驟"
      },
      {
        type: "paragraph",
        text: "建議企業採取「人機協同 (Human-in-the-loop)」漸進路線。先由 AI Agent 完成 90% 的繁瑣抽取與填寫，高風險財務關卡留給人工一鍵審核，累積足夠信心度後再逐步放行全自主運作。"
      }
    ]
  },
  {
    id: "multi-agent-orchestration",
    title: "打造自主協同的 Multi-Agent 架構：LangGraph 與角色分工的最佳實踐",
    category: "AI Agent",
    date: "2026-07-15",
    readTime: "7 分鐘閱讀",
    coverTag: "Multi-Agent System",
    summary: "單一大模型往往受限於上下文與注意力分散。透過多代理人協同 (Multi-Agent)，將架構師、研究員、編程員與審查員分工整合，能實現驚人的複雜任務解決率。",
    tags: ["Multi-Agent", "LangGraph", "角色協同", "狀態圖", "系統設計"],
    content: [
      {
        type: "lead",
        text: "正如一家成功的公司不能只靠一個超人員工包辦所有職務，複雜軟體與業務系統同樣無法依靠單一巨大的 Prompt 搞定。Multi-Agent 架構正是解決複雜度爆炸的最佳解法。"
      },
      {
        type: "heading",
        text: "一、為什麼需要多代理人？"
      },
      {
        type: "paragraph",
        text: "當給予模型過多長篇指令時，模型容易忽略中間細節。透過將大任務拆解，並分配給專職角色（例如：資訊檢索 Agent、大綱撰寫 Agent、程式碼實作 Agent、安全性審計 Agent），每個 Agent 擁有最精簡有力的 System Prompt，執行品質顯著提升。"
      },
      {
        type: "heading",
        text: "二、基於圖結構的狀態流轉 (LangGraph / StateGraph)"
      },
      {
        type: "paragraph",
        text: "早期的 Agent 串接只是單向鏈狀流程 (Linear Chains)，但真實協同需要循環、條件分支與反思機制 (Reflection)。LangGraph 允許我們將 Agent 定義為有向圖的節點 (Nodes)，狀態 (State) 透過邊 (Edges) 流轉。當審查 Agent 發現程式碼未通過單元測試時，可將控制權循環指派回修復 Agent，直到測試全部綠燈。"
      },
      {
        type: "heading",
        text: "三、防範通訊死結與 Token 浪費"
      },
      {
        type: "paragraph",
        text: "在設計 Multi-Agent 系統時，必須設定最大迭代輪次 (Max Recursion Limit) 與全域仲裁機制 (Router / Supervisor)，避免兩個 Agent 陷入無意義的禮貌對話或互相糾錯死循環。"
      }
    ]
  },
  {
    id: "ai-pm-roi-framework",
    title: "AI 產品經理必修課：如何評估企業生成式 AI 專案的真實 ROI 與產品價值",
    category: "產品策略",
    date: "2026-07-02",
    readTime: "6 分鐘閱讀",
    coverTag: "AI PM & ROI",
    summary: "生成式 AI 不僅是炫技，更是企業資本支出的重大決策。本文提供一套專為 AI PM 設計的評估框架：計費 Token 成本建模、人工作業節省工時量化、以及用戶留存增益計算。",
    tags: ["AI PM", "ROI 評估", "產品經理", "商業化", "營運成本"],
    content: [
      {
        type: "lead",
        text: "在 2024 年熱潮退去後，企業管理層不再問『我們用了什麼 AI』，而是問『這個 AI 專案究竟幫公司省下了多少錢、賺了多少收入？』AI 產品經理必須具備量化 ROI 的嚴謹財務模型。"
      },
      {
        type: "heading",
        text: "一、AI 專案的三大成本維度 (TCO)"
      },
      {
        type: "list",
        items: [
          "動態推理成本 (Token Costs)：根據每日活躍請求數 (DAU * 呼叫頻率) 計算輸入與輸出 Token 費用，並納入緩存 (Prompt Caching) 的折減效益。",
          "基礎設施與向量儲存成本 (Infra & DB)：向量儲存索引 (Vector Index)、專用運算節點與日誌系統託管費用。",
          "維護與人工審核成本 (HITL Costs)：高風險場景中人工抽檢與模型微調 (Fine-tuning) 的持續人月支出。"
        ]
      },
      {
        type: "heading",
        text: "二、價值衡量公式：節省工時 vs. 轉換提升"
      },
      {
        type: "paragraph",
        text: "在內部賦能型工具（如客服摘要、合約初審）中，ROI = (節省人工小時數 × 每小時人力成本 - AI 維運總成本) / AI 維運總成本。而在營收型產品中，則重點評估使用 AI 功能後的客戶付費率 (Conversion Rate) 與淨留存率 (NDR) 的提昇。"
      },
      {
        type: "heading",
        text: "三、快速驗證法：由小切口切入"
      },
      {
        type: "paragraph",
        text: "切忌一開始就規劃半年以上的宏大 AI 轉型大計。挑選企業痛點最明確、人工耗時最重複的單一垂直環節（例如『每週銷售週報彙整』），在 2-3 週內交付可衡量價值的 MVP，取得第一批管理層信任後再行規模化推廣。"
      }
    ]
  }
];
