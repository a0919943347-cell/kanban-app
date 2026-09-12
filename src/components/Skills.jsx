import React from 'react';
import { Cpu, Layout, Database, Compass, Wrench } from 'lucide-react';

const categoryIcons = {
  "AI & 智慧應用": Cpu,
  "前端開發": Layout,
  "後端與資料庫": Database,
  "產品思維與專案管理": Compass
};

export default function Skills({ skills }) {
  return (
    <section id="skills" style={{ background: 'var(--bg-surface)' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <Wrench size={14} />
            <span>EXPERTISE</span>
          </div>
          <h2 className="section-title">專業技能與技術矩陣</h2>
          <p className="section-subtitle">
            跨越 AI 演算法串接、現代前端互動體驗到敏捷產品規格制定的全方位技能樹。
          </p>
        </div>

        <div className="skills-grid">
          {skills.map((cat, idx) => {
            const IconComp = categoryIcons[cat.category] || Cpu;
            return (
              <div key={idx} className="skill-category-card">
                <h3 className="category-title">
                  <IconComp size={22} color="var(--primary)" />
                  <span>{cat.category}</span>
                </h3>

                <div className="skill-items">
                  {cat.items.map((skill, sIdx) => (
                    <div key={sIdx} className="skill-item">
                      <div className="skill-item-info">
                        <span style={{ color: 'var(--text-main)' }}>{skill.name}</span>
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{skill.level}%</span>
                      </div>
                      <div className="skill-bar-bg">
                        <div
                          className="skill-bar-fill"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
