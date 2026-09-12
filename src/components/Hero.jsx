import React from 'react';
import { ArrowRight, Mail, MapPin, Download } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';

export default function Hero({ personal }) {
  return (
    <section className="hero">
      <div className="container hero-grid">
        {/* Left column: Text & CTA */}
        <div>
          <div className="hero-tag">
            <span className="status-dot"></span>
            <span>{personal.status}</span>
          </div>

          <h1 className="hero-title">
            打造以 AI 驅動的 <br />
            <span className="gradient-text">卓越數位產品</span>
          </h1>

          <p className="hero-subtitle">
            我是 <strong>{personal.name}</strong>，{personal.subtitle}。專注於架構易用、強大且具備商業投資回報率的現代智慧應用。
          </p>

          <div className="hero-buttons">
            <a href="#projects" className="btn btn-primary">
              <span>探索精選作品</span>
              <ArrowRight size={18} />
            </a>
            <a href="#contact" className="btn btn-secondary">
              <Mail size={18} />
              <span>聯絡諮詢</span>
            </a>
            <a
              href="#resume"
              onClick={(e) => {
                e.preventDefault();
                alert("已觸發履歷檢視！您可在此綁定真實 PDF 履歷下載連結。");
              }}
              className="btn btn-secondary"
            >
              <Download size={18} />
              <span>下載簡歷</span>
            </a>
          </div>

          <div className="hero-socials">
            <span className="hero-social-label">關注與社群：</span>
            <a
              href={personal.socialLinks.github}
              target="_blank"
              rel="noreferrer"
              className="btn-icon"
              aria-label="GitHub"
            >
              <GithubIcon size={18} />
            </a>
            <a
              href={personal.socialLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              className="btn-icon"
              aria-label="LinkedIn"
            >
              <LinkedinIcon size={18} />
            </a>
            <a
              href={personal.socialLinks.email}
              className="btn-icon"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Right column: Avatar Profile Card */}
        <div>
          <div className="hero-avatar-card">
            <div className="hero-avatar-wrapper">
              <div className="hero-avatar-inner">
                {personal.avatarText}
              </div>
            </div>

            <h2 className="avatar-name">{personal.name}</h2>
            <p className="avatar-role">{personal.title}</p>

            <div className="avatar-location">
              <MapPin size={16} />
              <span>{personal.location}</span>
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                paddingTop: '1.2rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}
            >
              <span className="project-tag">#AI_Product</span>
              <span className="project-tag">#React</span>
              <span className="project-tag">#Agentic_Workflows</span>
              <span className="project-tag">#FastAPI</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
