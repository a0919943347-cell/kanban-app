import React from 'react';
import { Clock, Rocket, CheckCircle, Users, Target, Code, TrendingUp, UserCheck } from 'lucide-react';

const iconMap = {
  Clock: Clock,
  Rocket: Rocket,
  CheckCircle: CheckCircle,
  Users: Users
};

const valueIcons = [Target, Code, TrendingUp];

export default function About({ about, highlights }) {
  return (
    <section id="about" style={{ paddingTop: '1rem' }}>
      <div className="container">
        {/* Key Highlights Grid */}
        <div className="highlights-section">
          <div className="highlights-grid">
            {highlights.map((item, index) => {
              const IconComp = iconMap[item.icon] || CheckCircle;
              return (
                <div key={index} className="highlight-card">
                  <div className="highlight-icon">
                    <IconComp size={24} />
                  </div>
                  <div>
                    <div className="highlight-number">{item.number}</div>
                    <div className="highlight-label">{item.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <UserCheck size={14} />
            <span>ABOUT ME</span>
          </div>
          <h2 className="section-title">熱衷於用技術與設計創造影響力</h2>
          <p className="section-subtitle">
            深入探索技術可能性，並確保每一行程式碼與每一項產品決策都切中商業痛點。
          </p>
        </div>

        {/* About Grid: Bio + Core Values */}
        <div className="about-grid">
          <div className="about-bio">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.2rem', color: 'var(--text-main)' }}>
              個人簡介 & 歷程
            </h3>
            {about.bio.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="values-list">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
              核心產品價值觀
            </h3>
            {about.coreValues.map((val, idx) => {
              const ValIcon = valueIcons[idx % valueIcons.length];
              return (
                <div key={idx} className="value-card">
                  <h4>
                    <ValIcon size={18} color="var(--primary)" />
                    <span>{val.title}</span>
                  </h4>
                  <p>{val.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
