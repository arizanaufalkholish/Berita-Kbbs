import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiLogin, apiRegister, apiForgotPassword } from "../services/api";

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
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: null }));
    if (successMsg) setSuccessMsg("");
  };

  const pwValidation = validatePassword(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (mode === "register") {
      if (!pwValidation.isStrong) {
        newErrors.password = "Password belum memenuhi kriteria keamanan (Min. 8 karakter, Kombinasi Huruf Besar, Kecil, Angka, & Simbol).";
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
        setSuccessMsg("Autentikasi berhasil. Mengalihkan...");
        setTimeout(() => navigate("/"), 1000);
      } else if (mode === "register") {
        await apiRegister(form.name, form.email, form.password);
        setSuccessMsg("Akun berhasil dibuat. Silakan masuk.");
        setMode("login");
        setForm({ name: "", email: "", password: "", confirmPassword: "" });
      } else if (mode === "forgot") {
        const res = await apiForgotPassword(form.email);
        setSuccessMsg(res.message || "Instruksi reset password telah dikirim ke email Anda.");
      }
    } catch (err) {
      setErrors({ email: err.message || "Terjadi kesalahan." });
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-400", "bg-green-600"];
  const strengthLabels = ["Sangat Lemah", "Lemah", "Sedang", "Kuat", "Sangat Kuat"];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      {/* Left Panel - Imagery/Branding */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-surface-900 relative flex-col justify-between p-12 overflow-hidden">
        {/* Abstract newsy background with overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
            alt="News Background" 
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/80 to-transparent"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white tracking-tight">KBB<span className="text-primary-500">Sadunia</span>.</h1>
          </Link>
        </div>

        <div className="relative z-10 mb-8 max-w-lg">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            Portal Berita Terpercaya Bubuhan Banjar
          </h2>
          <p className="text-surface-300 text-lg leading-relaxed">
            Dapatkan akses ke berita terkini, artikel mendalam, dan informasi eksklusif komunitas Banjar di seluruh dunia.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center px-8 sm:px-12 py-16 bg-white relative">
        {/* Mobile Header */}
        <div className="md:hidden absolute top-8 left-8">
          <Link to="/">
            <h1 className="text-2xl font-bold text-surface-900">KBB<span className="text-primary-600">Sadunia</span>.</h1>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight mb-2">
              {mode === "login" ? "Selamat Datang" : mode === "register" ? "Buat Akun KBB" : "Reset Password"}
            </h2>
            <p className="text-surface-500">
              {mode === "login" 
                ? "Masukkan email dan password untuk melanjutkan." 
                : mode === "register" 
                ? "Daftar sekarang untuk bergabung dengan komunitas." 
                : "Masukkan email yang terdaftar untuk mengatur ulang sandi."}
            </p>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 rounded bg-green-50 text-green-800 border-l-4 border-green-500 text-sm font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {mode === "register" && (
              <div>
                <label htmlFor="auth-name" className="block text-sm font-medium text-surface-700 mb-1.5">Nama Lengkap</label>
                <input 
                  id="auth-name" type="text" value={form.name} onChange={set("name")} required 
                  className={`block w-full px-4 py-3 rounded-md border-surface-300 bg-surface-50 text-surface-900 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border'}`} 
                  placeholder="Hasan Basri"
                />
                {errors.name && <p className="text-xs text-red-600 mt-1.5">{errors.name}</p>}
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-surface-700 mb-1.5">Alamat Email</label>
              <input 
                id="auth-email" type="email" value={form.email} onChange={set("email")} required autoComplete="email"
                className={`block w-full px-4 py-3 rounded-md border-surface-300 bg-surface-50 text-surface-900 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border'}`} 
                placeholder="nama@email.com"
              />
              {errors.email && <p className="text-xs text-red-600 mt-1.5">{errors.email}</p>}
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="auth-password" className="block text-sm font-medium text-surface-700">Password</label>
                  {mode === "login" && (
                    <button type="button" onClick={() => { setMode("forgot"); setErrors({}); setSuccessMsg(""); }} className="text-sm font-semibold text-primary-600 hover:text-primary-700">Lupa password?</button>
                  )}
                </div>
                <input 
                  id="auth-password" type="password" value={form.password} onChange={set("password")} onFocus={() => mode === "register" && setShowPwStrength(true)} required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className={`block w-full px-4 py-3 rounded-md border-surface-300 bg-surface-50 text-surface-900 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border'}`} 
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-xs text-red-600 mt-1.5">{errors.password}</p>}
                
                {mode === "register" && showPwStrength && form.password.length > 0 && (
                  <div className="mt-3">
                    <div className="flex gap-1 mb-1.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1.5 w-full rounded-full transition-all duration-300 ${i < pwValidation.score ? strengthColors[pwValidation.score - 1] : "bg-surface-200"}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-semibold ${pwValidation.score >= 4 ? "text-green-600" : pwValidation.score >= 3 ? "text-yellow-600" : "text-red-500"}`}>
                      Kekuatan Sandi: {strengthLabels[Math.max(0, pwValidation.score - 1)] || "Sangat Lemah"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {mode === "register" && (
              <div>
                <label htmlFor="auth-confirm" className="block text-sm font-medium text-surface-700 mb-1.5">Konfirmasi Password</label>
                <input 
                  id="auth-confirm" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} required minLength={8} autoComplete="new-password" 
                  className={`block w-full px-4 py-3 rounded-md border-surface-300 bg-surface-50 text-surface-900 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : 'border'}`} 
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-xs text-red-600 mt-1.5">{errors.confirmPassword}</p>}
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2005/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {loading ? "Memproses..." : mode === "login" ? "Masuk" : mode === "register" ? "Daftar Akun" : "Kirim Tautan Reset"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-surface-200 pt-6">
            {mode === "forgot" ? (
              <p className="text-sm text-surface-600">
                Sudah ingat password? <button onClick={() => { setMode("login"); setErrors({}); setSuccessMsg(""); }} className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">Kembali ke Login</button>
              </p>
            ) : (
              <p className="text-sm text-surface-600">
                {mode === "login" ? "Belum memiliki akun?" : "Sudah memiliki akun?"}{" "}
                <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setErrors({}); setSuccessMsg(""); }} className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                  {mode === "login" ? "Daftar Sekarang" : "Masuk di Sini"}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
