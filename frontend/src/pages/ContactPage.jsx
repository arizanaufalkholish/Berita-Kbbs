import { useState } from "react";
import { useLang } from "../context/LangContext";

export default function ContactPage() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 3000); setForm({ name: "", email: "", subject: "", message: "" }); };
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="news-divider-bold mb-4" />
      <h1 className="text-2xl font-bold text-surface-900 mb-1">{t("contact.title")}</h1>
      <p className="text-surface-500 mb-8">{t("contact.desc")}</p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-lg border border-surface-200 p-6">
          {sent && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">✅ {t("contact.success")}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-surface-700 mb-1">{t("contact.name")} *</label>
                <input id="contact-name" type="text" value={form.name} onChange={set("name")} required className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400" />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-surface-700 mb-1">{t("contact.email")} *</label>
                <input id="contact-email" type="email" value={form.email} onChange={set("email")} required className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400" />
              </div>
            </div>
            <div>
              <label htmlFor="contact-subject" className="block text-sm font-medium text-surface-700 mb-1">{t("contact.subject")} *</label>
              <input id="contact-subject" type="text" value={form.subject} onChange={set("subject")} required className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400" />
            </div>
            <div>
              <label htmlFor="contact-message" className="block text-sm font-medium text-surface-700 mb-1">{t("contact.message")} *</label>
              <textarea id="contact-message" value={form.message} onChange={set("message")} rows={5} required className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 resize-none" />
            </div>
            <button type="submit" className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors">{t("contact.send")}</button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-surface-200 p-5">
            <h3 className="font-bold text-surface-900 mb-3">{t("contact.address")}</h3>
            <div className="space-y-3 text-sm text-surface-600">
              <p>📍 Jl. A. Yani No. 1, Barabai<br />Hulu Sungai Tengah, Kalimantan Selatan 71313</p>
              <p>📞 (0517) 123-4567</p>
              <p>✉️ info@hulusungai.or.id</p>
              <p>🌐 www.hulusungai.or.id</p>
            </div>
          </div>
          {/* Google Maps Embed */}
          <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
            <iframe title="Lokasi Perkumpulan Hulu Sungai" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63545.94!2d115.38!3d-2.58!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2de46ee3a3fffff%3A0x4030bfbca7a7e0!2sBarabai%2C+Hulu+Sungai+Tengah!5e0!3m2!1sid!2sid!4v1"
              width="100%" height="250" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
      </div>
    </div>
  );
}
