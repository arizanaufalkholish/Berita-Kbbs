import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import { apiLogin, apiRegister } from "../services/api";

// Password strength validator
function validatePassword(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  return { checks, score, isStrong: score >= 4 };
}

export default function AuthPage() {
  const { t } = useLang();
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwStrength, setShowPwStrength] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();
  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    // Clear error when user types
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: null }));
    if (successMsg) setSuccessMsg("");
  };

  const pwValidation = validatePassword(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validasi email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Validasi password strength (register)
    if (mode === "register") {
      if (!pwValidation.isStrong) {
        newErrors.password = "Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus";
      }
      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Konfirmasi password tidak cocok";
      }
      if (!form.name.trim()) {
        newErrors.name = "Nama wajib diisi";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await apiLogin(form.email, form.password);
        login(res.user);
        setSuccessMsg("Login berhasil! Mengalihkan...");
        setTimeout(() => navigate("/"), 1000);
      } else {
        await apiRegister(form.name, form.email, form.password);
        setSuccessMsg("Registrasi berhasil, silakan login.");
        setMode("login");
        setForm({ name: "", email: "", password: "", confirmPassword: "" });
      }
    } catch (err) {
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-green-500"];
  const strengthLabels = ["Sangat Lemah", "Lemah", "Sedang", "Kuat", "Sangat Kuat"];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50">
      <div className="w-full max-w-[400px]">
        <div className="bg-white border border-surface-300 shadow-none">
          
          {/* Header */}
          <div className="border-b border-surface-300 bg-surface-100 px-6 py-4 flex items-center justify-between">
            <h1 className="text-lg font-bold text-surface-900 uppercase tracking-wide">
              {mode === "login" ? "Masuk ke Akun" : "Daftar Akun Baru"}
            </h1>
            <Link to="/" className="text-xs text-primary-700 font-bold uppercase hover:underline tracking-widest">
              KBB
            </Link>
          </div>

          <div className="p-6">
            {successMsg && (
              <div className="mb-5 p-3 bg-green-50 text-green-800 border border-green-300 text-sm">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {mode === "register" && (
                <div>
                  <label htmlFor="auth-name" className="block text-xs font-bold text-surface-800 uppercase tracking-wide mb-1.5">{t("auth.name")}</label>
                  <input id="auth-name" type="text" value={form.name} onChange={set("name")} required className={`w-full px-3 py-2 border text-sm focus:outline-none focus:border-primary-700 focus:ring-0 ${errors.name ? "border-red-500 bg-red-50" : "border-surface-300 bg-surface-50"}`} />
                  {errors.name && <p className="text-xs text-red-600 mt-1 font-medium">{errors.name}</p>}
                </div>
              )}
              <div>
                <label htmlFor="auth-email" className="block text-xs font-bold text-surface-800 uppercase tracking-wide mb-1.5">{t("auth.email")}</label>
                <input id="auth-email" type="email" value={form.email} onChange={set("email")} required autoComplete="email" className={`w-full px-3 py-2 border text-sm focus:outline-none focus:border-primary-700 focus:ring-0 ${errors.email ? "border-red-500 bg-red-50" : "border-surface-300 bg-surface-50"}`} />
                {errors.email && <p className="text-xs text-red-600 mt-1 font-medium">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="auth-password" className="block text-xs font-bold text-surface-800 uppercase tracking-wide mb-1.5">{t("auth.password")}</label>
                <input id="auth-password" type="password" value={form.password} onChange={set("password")} onFocus={() => mode === "register" && setShowPwStrength(true)} required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} className={`w-full px-3 py-2 border text-sm focus:outline-none focus:border-primary-700 focus:ring-0 ${errors.password ? "border-red-500 bg-red-50" : "border-surface-300 bg-surface-50"}`} />
                {errors.password && <p className="text-xs text-red-600 mt-1 font-medium">{errors.password}</p>}
                
                {/* Password strength indicator */}
                {mode === "register" && showPwStrength && form.password.length > 0 && (
                  <div className="mt-2 space-y-1.5 bg-surface-50 p-2 border border-surface-200">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1.5 flex-1 transition-all duration-300 ${i < pwValidation.score ? strengthColors[pwValidation.score - 1] : "bg-surface-200"}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-bold uppercase ${pwValidation.score >= 4 ? "text-green-700" : pwValidation.score >= 3 ? "text-yellow-700" : "text-red-600"}`}>
                      {strengthLabels[Math.max(0, pwValidation.score - 1)] || "Sangat Lemah"}
                    </p>
                    <ul className="text-xs text-surface-600 space-y-0.5">
                      <li className={pwValidation.checks.length ? "text-green-700 font-bold" : ""}>- Minimal 8 karakter</li>
                      <li className={pwValidation.checks.uppercase ? "text-green-700 font-bold" : ""}>- Huruf besar (A-Z)</li>
                      <li className={pwValidation.checks.lowercase ? "text-green-700 font-bold" : ""}>- Huruf kecil (a-z)</li>
                      <li className={pwValidation.checks.number ? "text-green-700 font-bold" : ""}>- Angka (0-9)</li>
                      <li className={pwValidation.checks.special ? "text-green-700 font-bold" : ""}>- Karakter khusus</li>
                    </ul>
                  </div>
                )}
              </div>
              {mode === "register" && (
                <div>
                  <label htmlFor="auth-confirm" className="block text-xs font-bold text-surface-800 uppercase tracking-wide mb-1.5">{t("auth.confirmPassword")}</label>
                  <input id="auth-confirm" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} required minLength={8} autoComplete="new-password" className={`w-full px-3 py-2 border text-sm focus:outline-none focus:border-primary-700 focus:ring-0 ${errors.confirmPassword ? "border-red-500 bg-red-50" : "border-surface-300 bg-surface-50"}`} />
                  {errors.confirmPassword && <p className="text-xs text-red-600 mt-1 font-medium">{errors.confirmPassword}</p>}
                </div>
              )}
              {mode === "login" && (
                <div className="text-right">
                  <a href="#" className="text-xs font-bold text-primary-700 hover:underline">{t("auth.forgotPassword")}</a>
                </div>
              )}
              
              <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary-700 text-white font-bold uppercase tracking-wider text-sm hover:bg-primary-800 transition-colors disabled:opacity-50">
                  {loading ? "Memproses..." : (mode === "login" ? t("auth.loginBtn") : t("auth.registerBtn"))}
                </button>
              </div>
            </form>

          </div>
          
          <div className="bg-surface-100 border-t border-surface-300 p-4 text-center">
            <p className="text-sm text-surface-700">
              {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
              <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setErrors({}); setSuccessMsg(""); }} className="text-primary-700 font-bold hover:underline">
                {mode === "login" ? t("auth.register") : t("auth.login")}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
