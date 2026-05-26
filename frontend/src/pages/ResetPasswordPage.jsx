import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiResetPassword } from "../services/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(!token ? "Token reset password tidak ditemukan di URL." : "");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      await apiResetPassword(token, password);
      setSuccess("Password berhasil direset! Mengalihkan ke halaman login...");
      setTimeout(() => navigate("/auth"), 2000);
    } catch (err) {
      setError(err.message || "Gagal mereset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-surface-50">
      <div className="w-full max-w-[400px]">
        <div className="bg-white border border-surface-300 shadow-none">
          <div className="border-b border-surface-300 bg-surface-100 px-6 py-4 flex items-center justify-between">
            <h1 className="text-lg font-bold text-surface-900 uppercase tracking-wide">
              Reset Password
            </h1>
          </div>
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 text-sm">
                {success}
              </div>
            )}
            {email && !success && !error && (
              <p className="text-sm text-surface-600 mb-4">
                Mereset password untuk akun: <strong>{email}</strong>
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-surface-800 uppercase tracking-wide mb-1.5">Password Baru</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required minLength={8}
                  className="w-full px-3 py-2 border border-surface-300 bg-surface-50 text-sm focus:outline-none focus:border-primary-700" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-surface-800 uppercase tracking-wide mb-1.5">Konfirmasi Password</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required minLength={8}
                  className="w-full px-3 py-2 border border-surface-300 bg-surface-50 text-sm focus:outline-none focus:border-primary-700" 
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !token || !!success} 
                className="w-full py-2.5 bg-primary-700 text-white font-bold uppercase tracking-wider text-sm hover:bg-primary-800 transition-colors disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Simpan Password Baru"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
