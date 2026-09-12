import React, { useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Share2, Sparkles, ArrowRight, ChevronRight, BookOpen } from 'lucide-react';

export default function ArticleDetail({ article, allArticles, onBack, onSelectArticle, personal }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article]);

  const currentIndex = allArticles.findIndex((a) => a.id === article.id);
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : allArticles[0];

  // Smart Related Articles Algorithm (Category & Tags scoring)
  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id)
    .map((a) => {
      let score = 0;
      if (a.category === article.category) score += 3;
      const commonTags = a.tags.filter((tag) => article.tags.includes(tag));
      score += commonTags.length * 2;
      return { ...a, relevanceScore: score };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('文章網址已複製到剪貼簿！');
    }
  };

  return (
    <article className="article-detail-page">
      <div className="container" style={{ maxWidth: '880px', padding: '3rem 1.5rem 6rem' }}>
        {/* Top Back Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <button onClick={onBack} className="btn btn-secondary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.9rem' }}>
            <ArrowLeft size={16} />
            <span>返回專欄文章列表</span>
          </button>

          <button onClick={handleShare} className="btn-icon" title="分享文章">
            <Share2 size={16} />
          </button>
        </div>

        {/* Article Header */}
        <header className="article-header">
          <div className="article-meta" style={{ marginBottom: '1.2rem' }}>
            <span className="article-category-badge">{article.category}</span>
            <span className="article-meta-item">
              <Calendar size={14} />
              <span>{article.date}</span>
            </span>
            <span className="article-meta-item">
              <Clock size={14} />
              <span>{article.readTime}</span>
            </span>
          </div>

          <h1 className="article-title">{article.title}</h1>

          <div className="article-tags" style={{ marginTop: '1.2rem' }}>
            {article.tags.map((tag, idx) => (
              <span key={idx} className="project-tag" style={{ fontSize: '0.85rem', padding: '0.3rem 0.8rem' }}>
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2.5rem 0' }} />

        {/* Article Body Content */}
        <div className="article-body">
          {article.content.map((block, idx) => {
            if (block.type === 'lead') {
              return (
                <div key={idx} className="article-lead">
                  {block.text}
                </div>
              );
            }
            if (block.type === 'heading') {
              return (
                <h2 key={idx} className="article-section-title">
                  {block.text}
                </h2>
              );
            }
            if (block.type === 'paragraph') {
              return (
                <p key={idx} className="article-paragraph">
                  {block.text}
                </p>
              );
            }
            if (block.type === 'list') {
              return (
                <ul key={idx} className="article-list">
                  {block.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="article-list-item">
                      <span className="list-bullet">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            return null;
          })}
        </div>

        {/* Author Bio Box */}
        <div className="author-box">
          <div className="hero-avatar-wrapper" style={{ width: '64px', height: '64px', margin: 0, flexShrink: 0 }}>
            <div className="hero-avatar-inner" style={{ fontSize: '1.4rem' }}>
              {personal.avatarText}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
              {personal.name}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>
              {personal.title}
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              專注於企業級生成式 AI 架構、LLM Agent 系統整合與現代化全端架構。歡迎交流任何技術落地想法！
            </p>
          </div>
        </div>

        {/* RELATED ARTICLES SECTION (相關文章區塊) */}
        <div className="related-articles-section">
          <div className="related-section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="section-tag" style={{ marginBottom: 0 }}>
                <Sparkles size={14} />
                <span>RECOMMENDED</span>
              </div>
            </div>
            <h3 className="related-title">延伸閱讀・相關文章</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.3rem' }}>
              探索更多相關主題的 AI 架構設計、工程實戰與深度洞察。
            </p>
          </div>

          <div className="related-articles-grid">
            {relatedArticles.map((rel) => (
              <div
                key={rel.id}
                className="related-article-card"
                onClick={() => onSelectArticle(rel)}
              >
                <div>
                  <div className="article-meta" style={{ marginBottom: '0.6rem' }}>
                    <span className="article-category-badge">{rel.category}</span>
                    <span className="article-meta-item" style={{ fontSize: '0.78rem' }}>
                      <Clock size={12} />
                      <span>{rel.readTime}</span>
                    </span>
                  </div>

                  <h4 className="related-card-title">{rel.title}</h4>
                  <p className="related-card-summary">{rel.summary}</p>
                </div>

                <div className="related-card-footer">
                  <div className="article-tags" style={{ marginBottom: 0 }}>
                    {rel.tags.slice(0, 2).map((tag, tIdx) => (
                      <span key={tIdx} className="project-tag" style={{ fontSize: '0.72rem' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    className="read-more-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectArticle(rel);
                    }}
                    style={{ fontSize: '0.82rem' }}
                  >
                    <span>閱讀</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Article Recommendation Card */}
        {nextArticle && (
          <div
            className="next-article-card"
            onClick={() => onSelectArticle(nextArticle)}
            style={{ marginTop: '2.5rem' }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                下一篇循序閱讀
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {nextArticle.title}
              </div>
            </div>
            <div className="btn-icon" style={{ flexShrink: 0 }}>
              <ChevronRight size={18} />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
