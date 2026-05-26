import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGetArticles, apiDeleteArticle } from "../../services/api";
import { Helmet } from "react-helmet-async";

export default function ManageArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await apiGetArticles("?per_page=100"); // fetch all for simple admin
      setArticles(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Yakin ingin menghapus artikel "${title}"?`)) {
      try {
        await apiDeleteArticle(id);
        fetchArticles();
      } catch (err) {
        alert("Gagal menghapus artikel: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <Helmet><title>Kelola Artikel - Admin</title></Helmet>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-surface-900">Kelola Artikel</h1>
          <Link to="/admin/articles/create" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700">
            + Tulis Artikel
          </Link>
        </div>

        {loading ? (
          <p>Memuat artikel...</p>
        ) : (
          <div className="bg-white rounded-lg border border-surface-200 overflow-x-auto">
            <table className="w-full text-left text-sm text-surface-600">
              <thead className="bg-surface-50 text-surface-900 font-bold border-b border-surface-200">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Judul</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {articles.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3">{a.id}</td>
                    <td className="px-4 py-3 font-medium text-surface-800">{a.title}</td>
                    <td className="px-4 py-3">{a.category_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <Link to={`/admin/articles/edit/${a.id}`} className="text-primary-600 hover:underline font-medium">Edit</Link>
                      <button onClick={() => handleDelete(a.id, a.title)} className="text-red-600 hover:underline font-medium">Hapus</button>
                    </td>
                  </tr>
                ))}
                {articles.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-surface-500">Belum ada artikel.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
