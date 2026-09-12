import React, { useState, useEffect } from 'react';
import { portfolioData } from './data/portfolioData';
import { articlesData } from './data/articlesData';
import Navbar from './components/Navbar';
import Phase2Dashboard from './components/Phase2Dashboard';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Articles from './components/Articles';
import ArticleDetail from './components/ArticleDetail';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  const [currentView, setCurrentView] = useState('ecommerce'); // 'ecommerce' | 'portfolio'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('portfolio-theme');
    return saved || 'dark';
  });

  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }, [theme]);

  // Handle URL hash routing for direct links to articles (e.g., #article/rag-enterprise-architecture)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#article/')) {
        const articleId = hash.replace('#article/', '');
        const found = articlesData.find((a) => a.id === articleId);
        if (found) {
          setSelectedArticle(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (selectedArticle && !hash.startsWith('#article/')) {
        setSelectedArticle(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectedArticle]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
    window.location.hash = `#article/${article.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToArticles = () => {
    setSelectedArticle(null);
    window.location.hash = '#articles';
    setTimeout(() => {
      const element = document.getElementById('articles');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleNavigate = (href) => {
    if (selectedArticle) {
      setSelectedArticle(null);
      window.location.hash = href;
      setTimeout(() => {
        if (href === '#') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const targetId = href.replace('#', '');
          const element = document.getElementById(targetId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 100);
    }
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 頂部切換橫幅 (Phase 2 電商後台 vs 個人作品集) */}
      <div style={{
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #334155',
        padding: '8px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        position: 'sticky',
        top: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>AI PM WEEK 6</span>
          <span>•</span>
          <span>系統模式切換：</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setCurrentView('ecommerce')}
            style={{
              backgroundColor: currentView === 'ecommerce' ? '#4f46e5' : '#1e293b',
              color: currentView === 'ecommerce' ? '#ffffff' : '#cbd5e1',
              border: '1px solid',
              borderColor: currentView === 'ecommerce' ? '#6366f1' : '#475569',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            🛒 電商後台 (Phase 2)
          </button>
          <button
            onClick={() => setCurrentView('portfolio')}
            style={{
              backgroundColor: currentView === 'portfolio' ? '#4f46e5' : '#1e293b',
              color: currentView === 'portfolio' ? '#ffffff' : '#cbd5e1',
              border: '1px solid',
              borderColor: currentView === 'portfolio' ? '#6366f1' : '#475569',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            📁 個人作品集
          </button>
        </div>
      </div>

      {currentView === 'ecommerce' ? (
        <Phase2Dashboard />
      ) : (
        <>
          {/* Background ambient lighting */}
          <div className="ambient-glow" aria-hidden="true">
            <div className="glow-1" />
            <div className="glow-2" />
            <div className="glow-3" />
          </div>

          {/* Navigation bar */}
          <Navbar
            theme={theme}
            toggleTheme={toggleTheme}
            personal={portfolioData.personal}
            onNavigate={handleNavigate}
          />

          {/* Main Content Area */}
          <main>
            {selectedArticle ? (
              <ArticleDetail
                article={selectedArticle}
                allArticles={articlesData}
                onBack={handleBackToArticles}
                onSelectArticle={handleSelectArticle}
                personal={portfolioData.personal}
              />
            ) : (
              <>
                <Hero personal={portfolioData.personal} />
                <About
                  about={portfolioData.about}
                  highlights={portfolioData.highlights}
                />
                <Skills skills={portfolioData.skills} />
                <Projects projects={portfolioData.projects} />
                <Articles
                  articles={articlesData}
                  onSelectArticle={handleSelectArticle}
                />
                <Experience
                  experiences={portfolioData.experiences}
                  education={portfolioData.education}
                />
                <Contact personal={portfolioData.personal} />
              </>
            )}
          </main>

          {/* Footer */}
          <Footer personal={portfolioData.personal} />
        </>
      )}
    </div>
  );
}
