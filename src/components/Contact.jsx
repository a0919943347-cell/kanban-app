import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function Contact({ personal }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 800);
  };

  return (
    <section id="contact">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <MessageSquare size={14} />
            <span>GET IN TOUCH</span>
          </div>
          <h2 className="section-title">與我聯繫與合作洽談</h2>
          <p className="section-subtitle">
            無論是有企業 AI 導入諮詢、全端專案合作，或是想聊聊產品創新，都非常歡迎與我交流！
          </p>
        </div>

        <div className="contact-grid">
          {/* Contact Details */}
          <div className="contact-info-card">
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.6rem' }}>
              聯絡方式
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              我通常會在 24 小時內回覆您的訊息。若有緊急諮詢，亦可直接透過電子郵件或電話聯繫。
            </p>

            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="contact-info-label">電子信箱</div>
                  <a href={`mailto:${personal.email}`} className="contact-info-val">
                    {personal.email}
                  </a>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="contact-info-label">連絡電話</div>
                  <a href={`tel:${personal.phone}`} className="contact-info-val">
                    {personal.phone}
                  </a>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="contact-info-label">所在城市</div>
                  <span className="contact-info-val">{personal.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Form */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">您的稱呼 / 姓名</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="例如：王小明"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">電子信箱</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">洽談主題</label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="例如：企業 AI 知識庫建置諮詢"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">訊息內容</label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="請簡述您的需求或合作想法..."
                className="form-textarea"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              <Send size={16} />
              <span>{loading ? '傳送中...' : '送出留言'}</span>
            </button>

            {submitted && (
              <div className="form-success-msg">
                <CheckCircle2 size={18} />
                <span>感謝您的來信！訊息已成功寄送，我將儘快與您聯繫。</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
