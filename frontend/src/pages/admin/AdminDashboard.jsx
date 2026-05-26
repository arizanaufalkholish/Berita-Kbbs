import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Helmet } from "react-helmet-async";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <Helmet>
        <title>Admin Dashboard - KBB Sadunia</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-surface-900 mb-2">Dashboard Admin</h1>
        <p className="text-surface-600 mb-8">Selamat datang, {user?.name} ({user?.role})</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/articles" className="bg-white p-6 rounded-lg border border-surface-200 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center group">
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">📝</span>
            <h2 className="text-lg font-bold text-surface-900 group-hover:text-primary-600">Kelola Artikel</h2>
            <p className="text-sm text-surface-500 mt-2">Buat, edit, dan hapus artikel berita</p>
          </Link>
          
          <div className="bg-surface-100 p-6 rounded-lg border border-surface-200 flex flex-col items-center justify-center text-center opacity-70 cursor-not-allowed">
            <span className="text-4xl mb-3">💬</span>
            <h2 className="text-lg font-bold text-surface-900">Komentar</h2>
            <p className="text-sm text-surface-500 mt-2">Segera Hadir</p>
          </div>

          <div className="bg-surface-100 p-6 rounded-lg border border-surface-200 flex flex-col items-center justify-center text-center opacity-70 cursor-not-allowed">
            <span className="text-4xl mb-3">📂</span>
            <h2 className="text-lg font-bold text-surface-900">Kategori</h2>
            <p className="text-sm text-surface-500 mt-2">Segera Hadir</p>
          </div>
        </div>
      </div>
    </div>
  );
}
