import React, { useState } from 'react';
import { Layers, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import { GithubIcon } from './Icons';

export default function Projects({ projects }) {
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(projects.map((p) => p.category))];

  const filteredProjects =
    filter === 'All'
      ? projects
      : projects.filter((p) => p.category === filter);

  return (
    <section id="projects">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <Layers size={14} />
            <span>PORTFOLIO</span>
          </div>
          <h2 className="section-title">精選專案與實戰成果</h2>
          <p className="section-subtitle">
            精選具備商業效益驗證的真實專案，涵蓋從企業 Agent 系統到資料視覺化儀表板。
          </p>

          {/* Filter Pills */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.6rem',
              flexWrap: 'wrap',
              marginTop: '1.8rem'
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  padding: '0.45rem 1.1rem',
                  borderRadius: 'var(--radius-full)',
                  border: filter === cat ? '1px solid var(--primary)' : '1px solid var(--border)',
                  background: filter === cat ? 'var(--primary)' : 'var(--bg-card)',
                  color: filter === cat ? '#ffffff' : 'var(--text-muted)',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="projects-grid">
          {filteredProjects.map((proj) => (
            <div key={proj.id} className="project-card">
              <div>
                <div className="project-category">{proj.category}</div>
                <h3 className="project-title">{proj.title}</h3>
                <p className="project-desc">{proj.description}</p>

                {proj.metrics && (
                  <div className="project-metrics">
                    <TrendingUp size={15} />
                    <span>{proj.metrics}</span>
                  </div>
                )}

                <div className="project-tags">
                  {proj.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="project-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="project-links">
                <a
                  href={proj.demoUrl}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`點擊查看「${proj.title}」專案展示！`);
                  }}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
                >
                  <ExternalLink size={15} />
                  <span>線上展示</span>
                </a>
                <a
                  href={proj.repoUrl}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`點擊查看「${proj.title}」原始程式碼倉庫！`);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 0.9rem', fontSize: '0.85rem' }}
                  aria-label="查看程式碼"
                >
                  <GithubIcon size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
