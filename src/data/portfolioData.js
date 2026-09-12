export const portfolioData = {
  personal: {
    name: "Alex Chen (陳逸凡)",
    chineseName: "陳逸凡",
    title: "AI 產品經理 & 全端技術顧問",
    subtitle: "專注於企業級生成式 AI 落地、智慧 Agent 系統與現代化 Web 全端開發",
    location: "台灣，台北 (Taipei, Taiwan)",
    email: "alex.chen.innovate@example.com",
    phone: "+886 912 345 678",
    status: "可承接專案 / 開放正職與顧問機會",
    avatarText: "AC",
    socialLinks: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      email: "mailto:alex.chen.innovate@example.com"
    }
  },

  highlights: [
    { number: "5+", label: "年數位產品與軟體經驗", icon: "Clock" },
    { number: "12+", label: "個企業級 AI 專案上線", icon: "Rocket" },
    { number: "98%", label: "專案準時交付與滿意度", icon: "CheckCircle" },
    { number: "30K+", label: "每月活躍使用者服務規模", icon: "Users" }
  ],

  about: {
    bio: [
      "您好！我是 Alex，一名熱衷於將前沿人工智慧技術轉化為實際商業價值的 AI 產品經理與全端工程師。",
      "在過去數年間，我主導了多個企業級生成式 AI 應用、智慧客服 Agent 以及現代化響應式 Web 系統的架構與落地，擅長在產品設計、商業思維與深層技術架構之間建立順暢的溝通橋樑。",
      "我深信好的產品不僅僅是演算法的堆疊，更是對使用者真實痛點的深刻理解與極致簡潔的使用者體驗。"
    ],
    coreValues: [
      {
        title: "AI 商業落地導向",
        desc: "不盲目追求新技術，專注於 ROI 與客戶核心業務指標的實際提昇。"
      },
      {
        title: "端到端全端工程",
        desc: "兼具前後端、雲端佈署與 LLM 應用鏈路串接能力，縮短 MVP 迭代週期。"
      },
      {
        title: "敏捷迭代與數據驅動",
        desc: "以指標衡量假設，透過快速 Prototype 與用戶回饋持續精進產品體驗。"
      }
    ]
  },

  skills: [
    {
      category: "AI & 智慧應用",
      items: [
        { name: "LLM Prompt Engineering & RAG", level: 92 },
        { name: "LangChain / LlamaIndex", level: 88 },
        { name: "Multi-Agent 系統架構", level: 85 },
        { name: "OpenAI / Claude / Gemini API", level: 95 }
      ]
    },
    {
      category: "前端開發",
      items: [
        { name: "React.js / Next.js", level: 90 },
        { name: "TypeScript / JavaScript ES6+", level: 88 },
        { name: "Tailwind CSS / 現代響應式設計", level: 92 },
        { name: "狀態管理 (Zustand, Redux)", level: 85 }
      ]
    },
    {
      category: "後端與資料庫",
      items: [
        { name: "Node.js / Express / Fastify", level: 85 },
        { name: "Python / FastAPI", level: 88 },
        { name: "PostgreSQL / MongoDB", level: 82 },
        { name: "Vector DB (Pinecone, Chroma)", level: 86 }
      ]
    },
    {
      category: "產品思維與專案管理",
      items: [
        { name: "PRD 撰寫與使用者旅程設計", level: 95 },
        { name: "Scrum / 敏捷專案管理", level: 90 },
        { name: "UX / UI Prototype (Figma)", level: 84 },
        { name: "A/B 測試與數據漏斗分析", level: 88 }
      ]
    }
  ],

  projects: [
    {
      id: 1,
      title: "NexusAI 企業級智聯中樞",
      category: "生成式 AI",
      description: "基於 RAG 架構的多模型混合企業知識庫，支援上百萬字文檔秒級檢索與智能問答，提昇客服回應效率 65%。",
      tags: ["React", "FastAPI", "RAG", "Vector DB", "Tailwind CSS"],
      metrics: "客服工單自動解決率提昇 40%",
      demoUrl: "#",
      repoUrl: "#"
    },
    {
      id: 2,
      title: "OmniAgent 自動化工作流程引擎",
      category: "Agent 系統",
      description: "跨系統自動化協同 Agent，串接 CRM、ERP 與 Slack，協助業務團隊自動化摘要客戶需求並生成提案草稿。",
      tags: ["React", "Node.js", "Multi-Agent", "LangChain", "Redis"],
      metrics: "業務日常文檔處理時間縮短 50%",
      demoUrl: "#",
      repoUrl: "#"
    },
    {
      id: 3,
      title: "SmartPulse 產品數據分析看板",
      category: "Web 平台",
      description: "即時監控用戶流失預警與功能留存率的 SaaS 分析儀表板，具備強大互動圖表與自動洞察提示功能。",
      tags: ["React.js", "TypeScript", "Recharts", "REST API"],
      metrics: "已部署至 3 家中型企業 SaaS",
      demoUrl: "#",
      repoUrl: "#"
    }
  ],

  experiences: [
    {
      period: "2023 - 至今",
      role: "資深 AI 產品經理 (Senior AI PM)",
      company: "智馭科技股份有限公司 (Nexus AI Lab)",
      description: "主導企業級生成式 AI 解決方案由 0 到 1 的產品化落地，管理 8 人跨職能研發團隊（前後端、演算法、UI/UX），推動 12+ 家企業客戶成功導入。"
    },
    {
      period: "2021 - 2023",
      role: "全端工程師兼產品負責人",
      company: "雲訊創新數位科技",
      description: "負責核心 SaaS 平台前端架構重構（遷移至 React/TypeScript），並設計高可用性微服務後端 API，使系統反應時間縮短 35%。"
    },
    {
      period: "2019 - 2021",
      role: "前端工程師",
      company: "極客創意數位工作室",
      description: "參與多個大型客製化網站與電商平台之設計與前端開發，累積扎實的現代 CSS 動畫、響應式佈局與跨瀏覽器相容性實戰經驗。"
    }
  ],

  education: [
    {
      period: "2015 - 2019",
      degree: "資訊工程學系 學士",
      school: "國立成功大學 (NCKU)",
      details: "主修軟體工程與人機互動設計，曾獲校園創新專案競賽特優。"
    }
  ]
};
