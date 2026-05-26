import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiCreateArticle, apiUpdateArticle, apiGetCategories } from "../../services/api";
import { Helmet } from "react-helmet-async";

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: "", excerpt: "", content: "", image_url: "", category_id: "", status: "draft"
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    apiGetCategories().then(res => setCategories(res.data || []));

    if (isEdit) {
      // Find the article to edit by ID (the API only has slug endpoint for direct single fetch,
      // so we fetch all or we can use the list, but since backend has /api/articles/:id ... Wait,
      // yes, backend has /api/articles/(\d+) which we can hit directly or we just fetch from apiGetArticles list)
      fetch(`/api/articles/${id}`)
        .then(r => r.json())
        .then(res => {
          if (res.data) {
            setFormData({
              title: res.data.title,
              excerpt: res.data.excerpt,
              content: res.data.content,
              image_url: res.data.image_url || "",
              category_id: res.data.category_id,
              status: res.data.status
            });
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await apiUpdateArticle(id, formData);
        alert("Artikel berhasil diperbarui");
      } else {
        await apiCreateArticle(formData);
        alert("Artikel berhasil dibuat");
      }
      navigate("/admin/articles");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (loading) return <div className="p-8">Memuat...</div>;

  return (
    <div className="min-h-screen bg-surface-50 py-8">
      <Helmet><title>{isEdit ? "Edit" : "Buat"} Artikel - Admin</title></Helmet>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-surface-900 mb-6">{isEdit ? "Edit" : "Buat"} Artikel</h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-surface-200 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-bold text-surface-700 mb-1">Judul Artikel</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required
                   className="w-full p-2 border border-surface-300 rounded focus:ring-primary-500 focus:border-primary-500" />
          </div>

          <div>
            <label className="block text-sm font-bold text-surface-700 mb-1">Ringkasan (Excerpt)</label>
            <textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} rows={2}
                      className="w-full p-2 border border-surface-300 rounded focus:ring-primary-500 focus:border-primary-500" />
          </div>

          <div>
            <label className="block text-sm font-bold text-surface-700 mb-1">Kategori</label>
            <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} required
                    className="w-full p-2 border border-surface-300 rounded focus:ring-primary-500 focus:border-primary-500">
              <option value="">-- Pilih Kategori --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-surface-700 mb-1">URL Gambar Header</label>
            <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})}
                   className="w-full p-2 border border-surface-300 rounded focus:ring-primary-500 focus:border-primary-500" placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-bold text-surface-700 mb-1">Konten HTML</label>
            <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} rows={10} required
                      className="w-full p-2 border border-surface-300 rounded focus:ring-primary-500 focus:border-primary-500 font-mono text-sm" />
          </div>

          <div>
            <label className="block text-sm font-bold text-surface-700 mb-1">Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 border border-surface-300 rounded focus:ring-primary-500 focus:border-primary-500">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => navigate("/admin/articles")} className="px-4 py-2 bg-surface-200 text-surface-800 rounded font-semibold hover:bg-surface-300">Batal</button>
            <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded font-semibold hover:bg-primary-700">Simpan Artikel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
