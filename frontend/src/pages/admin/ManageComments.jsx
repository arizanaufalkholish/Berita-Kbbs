import { useEffect, useState } from "react";
import { apiGetAdminComments, apiUpdateCommentStatus, apiDeleteComment } from "../../services/api";
import { Helmet } from "react-helmet-async";

export default function ManageComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await apiGetAdminComments();
        if (!ignore) setComments(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const fetchComments = async () => {
    try {
      const res = await apiGetAdminComments();
      setComments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await apiUpdateCommentStatus(id, status);
      fetchComments();
    } catch (err) {
      alert("Gagal mengupdate status: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus komentar ini?")) {
      try {
        await apiDeleteComment(id);
        fetchComments();
      } catch (err) {
        alert("Gagal menghapus komentar: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <Helmet><title>Kelola Komentar - Admin</title></Helmet>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-surface-900">Moderasi Komentar</h1>
        </div>

        {loading ? (
          <p>Memuat komentar...</p>
        ) : (
          <div className="bg-white rounded-lg border border-surface-200 overflow-x-auto">
            <table className="w-full text-left text-sm text-surface-600">
              <thead className="bg-surface-50 text-surface-900 font-bold border-b border-surface-200">
                <tr>
                  <th className="px-4 py-3">Artikel</th>
                  <th className="px-4 py-3">Penulis</th>
                  <th className="px-4 py-3">Komentar</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {comments.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 max-w-[200px] truncate" title={c.article_title}>{c.article_title}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-surface-900">{c.author_name}</div>
                      <div className="text-xs text-surface-500">{c.author_email || '-'}</div>
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <p className="line-clamp-2">{c.content}</p>
                      <div className="text-xs text-surface-400 mt-1">{new Date(c.created_at).toLocaleString('id-ID')}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${c.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {c.status === 'pending' ? (
                          <button onClick={() => handleUpdateStatus(c.id, 'approved')} className="text-green-600 hover:underline font-medium text-xs">Setuju</button>
                        ) : (
                          <button onClick={() => handleUpdateStatus(c.id, 'pending')} className="text-yellow-600 hover:underline font-medium text-xs">Tunda</button>
                        )}
                        <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline font-medium text-xs">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {comments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-surface-500">Belum ada komentar.</td>
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
