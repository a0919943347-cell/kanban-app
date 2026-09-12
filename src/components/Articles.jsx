import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, ArrowRight, Tag, Search } from 'lucide-react';

export default function Articles({ articles, onSelectArticle }) {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['全部', ...new Set(articles.map((a) => a.category))];

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === '全部' || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="articles" style={{ background: 'var(--bg-surface)' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <BookOpen size={14} />
            <span>AI INSIGHTS &amp; BLOG</span>
          </div>
          <h2 className="section-title">技術專欄與 AI 洞察</h2>
          <p className="section-subtitle">
            深入剖析生成式 AI 架構落地、提示工程技巧、Vibe Coding 開發範式與智慧流程自動化。
          </p>

          {/* Search & Category Filter Bar */}
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '460px' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-dim)'
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋文章關鍵字 (例如：RAG, Prompt, Vibe...)"
                className="form-input"
                style={{
                  paddingLeft: '2.8rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-card)'
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap'
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    border: selectedCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                    color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                    fontSize: '0.86rem',
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
        </div>

        {/* Article Cards Grid */}
        <div className="articles-grid">
          {filteredArticles.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              沒有找到符合「{searchQuery}」的相關文章。
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div
                key={article.id}
                className="article-card"
                onClick={() => onSelectArticle(article)}
              >
                <div>
                  <div className="article-meta">
                    <span className="article-category-badge">{article.category}</span>
                    <span className="article-meta-item">
                      <Calendar size={13} />
                      <span>{article.date}</span>
                    </span>
                    <span className="article-meta-item">
                      <Clock size={13} />
                      <span>{article.readTime}</span>
                    </span>
                  </div>

                  <h3 className="article-card-title">{article.title}</h3>
                  <p className="article-card-summary">{article.summary}</p>

                  <div className="article-tags">
                    {article.tags.map((tag, idx) => (
                      <span key={idx} className="project-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="article-card-footer">
                  <button
                    className="read-more-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectArticle(article);
                    }}
                  >
                    <span>閱讀全文</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
