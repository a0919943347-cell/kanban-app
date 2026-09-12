import React from 'react';
import { Briefcase, GraduationCap, Calendar } from 'lucide-react';

export default function Experience({ experiences, education }) {
  return (
    <section id="experience" style={{ background: 'var(--bg-surface)' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <Briefcase size={14} />
            <span>CAREER & EDUCATION</span>
          </div>
          <h2 className="section-title">職涯歷程與學歷背景</h2>
          <p className="section-subtitle">
            過去在不同角色中的成長足跡，持續精進技術深度與商業宏觀視野。
          </p>
        </div>

        <div className="timeline">
          {experiences.map((exp, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-card">
                <div className="timeline-header">
                  <div className="timeline-role">{exp.role}</div>
                  <div className="timeline-period">
                    <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                    {exp.period}
                  </div>
                </div>
                <div className="timeline-company">{exp.company}</div>
                <p className="timeline-desc">{exp.description}</p>
              </div>
            </div>
          ))}

          {/* Education items */}
          {education.map((edu, idx) => (
            <div key={`edu-${idx}`} className="timeline-item">
              <div className="timeline-dot" style={{ background: 'var(--secondary)' }} />
              <div className="timeline-card">
                <div className="timeline-header">
                  <div className="timeline-role" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <GraduationCap size={18} color="var(--secondary)" />
                    <span>{edu.degree}</span>
                  </div>
                  <div className="timeline-period">{edu.period}</div>
                </div>
                <div className="timeline-company">{edu.school}</div>
                <p className="timeline-desc">{edu.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
