import React from 'react';
import { ArrowUp, Heart } from 'lucide-react';

export default function Footer({ personal }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          © {new Date().getFullYear()} {personal.name}. All Rights Reserved.
          <div style={{ fontSize: '0.8rem', marginTop: '0.2rem', color: 'var(--text-dim)' }}>
            Built with React.js, Vite &amp; Passion <Heart size={12} color="#ec4899" style={{ display: 'inline' }} />
          </div>
        </div>

        <button
          onClick={scrollToTop}
          className="btn btn-secondary"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}
        >
          <ArrowUp size={14} />
          <span>回到頂部</span>
        </button>
      </div>
    </footer>
  );
}
