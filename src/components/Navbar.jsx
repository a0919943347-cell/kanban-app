import React, { useState } from 'react';
import { Sun, Moon, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar({ theme, toggleTheme, personal, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: '關於我', href: '#about' },
    { label: '專業技能', href: '#skills' },
    { label: '精選專案', href: '#projects' },
    { label: '技術專欄', href: '#articles' },
    { label: '歷練經歷', href: '#experience' },
    { label: '聯絡我', href: '#contact' }
  ];

  const handleNavClick = (e, href) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(href);
    }
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a href="#" onClick={(e) => handleNavClick(e, '#')} className="logo">
          <div className="logo-badge">
            <Sparkles size={18} />
          </div>
          <span>{personal.name.split(' ')[0]} Portfolio</span>
        </a>

        {/* Desktop Navigation */}
        <nav>
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action buttons */}
        <div className="nav-actions">
          <button
            onClick={toggleTheme}
            className="btn-icon"
            aria-label="切換深淺色主題"
            title={theme === 'dark' ? '切換為淺色模式' : '切換為深色模式'}
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
          >
            與我聊聊
          </a>

          {/* Mobile Menu Button */}
          <button
            className="btn-icon mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="選單開關"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
            padding: '1.2rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              style={{
                color: 'var(--text-main)',
                textDecoration: 'none',
                fontSize: '1.05rem',
                fontWeight: 500,
                padding: '0.4rem 0'
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
