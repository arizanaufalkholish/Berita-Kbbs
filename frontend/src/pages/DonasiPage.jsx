import { useState } from "react";
import { useLang } from "../context/LangContext";

const amounts = [50000, 100000, 250000, 500000, 1000000];

export default function DonasiPage() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", amount: 100000, customAmount: "", message: "", method: "midtrans" });
  const [step, setStep] = useState(1);
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(2);
    // In production: call Midtrans Snap API or PayPal SDK
    // \Midtrans\Config::$serverKey = Vault.get('midtrans_key');
    // $snapToken = \Midtrans\Snap::getSnapToken($params);
  };

  if (step === 2) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-xl border border-surface-200 p-8">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-surface-900 mb-2">{t("donate.thanks")}</h2>
          <p className="text-surface-500 text-sm mb-2">Donasi: <strong>Rp {Number(form.customAmount || form.amount).toLocaleString("id-ID")}</strong></p>
          <p className="text-surface-500 text-sm mb-6">Metode: <strong>{form.method === "midtrans" ? "Midtrans" : form.method === "paypal" ? "PayPal" : "Transfer Bank"}</strong></p>
          <div className="p-4 rounded-lg bg-surface-50 border border-surface-200 mb-6 text-sm text-surface-600">
            {form.method === "midtrans" && <p>Anda akan diarahkan ke halaman pembayaran Midtrans Snap untuk menyelesaikan transaksi.</p>}
            {form.method === "paypal" && <p>Anda akan diarahkan ke PayPal untuk menyelesaikan pembayaran secara aman.</p>}
            {form.method === "transfer" && (
              <div><p className="font-semibold mb-1">Transfer ke:</p><p>Bank Kalsel · 001-234-5678<br />a.n. Perkumpulan Hulu Sungai</p></div>
            )}
          </div>
          <button onClick={() => setStep(1)} className="px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors">Donasi Lagi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="news-divider-bold mb-4" />
      <h1 className="text-2xl font-bold text-surface-900 mb-1">{t("donate.title")}</h1>
      <p className="text-surface-500 mb-8">{t("donate.desc")}</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-surface-200 p-6 space-y-5">
        {/* Amount */}
        <fieldset>
          <legend className="block text-sm font-medium text-surface-700 mb-2">{t("donate.amount")}</legend>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {amounts.map((a) => (
              <button key={a} type="button" onClick={() => setForm((p) => ({ ...p, amount: a, customAmount: "" }))}
                className={`py-2 rounded-lg text-sm font-semibold border transition-all ${form.amount === a && !form.customAmount ? "bg-primary-600 text-white border-primary-600" : "bg-white text-surface-700 border-surface-200 hover:border-primary-300"}`}>
                {(a / 1000)}K
              </button>
            ))}
          </div>
          <label htmlFor="custom-amount" className="sr-only">Nominal lain</label>
          <input id="custom-amount" type="number" min="1000" placeholder="Nominal lain (Rp)" value={form.customAmount} onChange={(e) => setForm((p) => ({ ...p, customAmount: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400" />
        </fieldset>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="donate-name" className="block text-sm font-medium text-surface-700 mb-1">{t("donate.name")} *</label>
            <input id="donate-name" type="text" value={form.name} onChange={set("name")} required className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div>
            <label htmlFor="donate-email" className="block text-sm font-medium text-surface-700 mb-1">{t("donate.email")} *</label>
            <input id="donate-email" type="email" value={form.email} onChange={set("email")} required className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
        </div>

        <div>
          <label htmlFor="donate-message" className="block text-sm font-medium text-surface-700 mb-1">{t("donate.message")}</label>
          <textarea id="donate-message" value={form.message} onChange={set("message")} rows={2} className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none" />
        </div>

        {/* Payment method */}
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">{t("donate.method")}</label>
          <div className="grid grid-cols-3 gap-3">
            {[{k:"midtrans",l:"Midtrans",i:"💳"},{k:"paypal",l:"PayPal",i:"🅿️"},{k:"transfer",l:"Transfer",i:"🏦"}].map((m) => (
              <button key={m.k} type="button" onClick={() => setForm((p) => ({ ...p, method: m.k }))}
                className={`py-3 rounded-lg border text-center transition-all ${form.method === m.k ? "border-primary-500 bg-primary-50 ring-2 ring-primary-500/20" : "border-surface-200 hover:border-primary-300"}`}>
                <span className="text-xl block mb-1">{m.i}</span>
                <span className="text-xs font-semibold text-surface-700">{m.l}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-surface-400">
          <span>🔒</span> {t("donate.secure")}
        </div>

        <button type="submit" className="w-full py-3 rounded-lg bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors">{t("donate.submit")}</button>
      </form>
    </div>
  );
}
