const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:8000/api");

function getAuthHeader() {
  // Authentication is handled automatically via HTTPOnly cookie
  return {};
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return "";
}

async function ensureCSRFToken() {
  if (getCookie("csrf_token")) return;

  // GET request ini dipakai untuk memancing backend membuat cookie csrf_token
  await fetch(`${API_URL}/health`, {
    method: "GET",
    credentials: "include",
  });
}

export async function fetchAPI(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    await ensureCSRFToken();
  }

  const csrfToken = getCookie("csrf_token");

  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "An error occurred");
  }

  return data;
}

// Articles API
export const apiGetArticles = (params = "") => fetchAPI(`/articles${params}`);
export const apiSearchArticles = (query) => fetchAPI(`/articles?search=${encodeURIComponent(query)}`);
export const apiGetArticleBySlug = (slug) => fetchAPI(`/articles/slug/${slug}`);
export const apiGetTrending = () => fetchAPI("/trending");
export const apiGetCategories = () => fetchAPI("/categories");
export const apiGetSitemap = () => fetchAPI("/sitemap");

export const apiCreateArticle = (data) => fetchAPI("/articles", { method: "POST", body: JSON.stringify(data) });
export const apiUpdateArticle = (id, data) => fetchAPI(`/articles/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const apiDeleteArticle = (id) => fetchAPI(`/articles/${id}`, { method: "DELETE" });

export const apiUploadImage = async (file) => {
  await ensureCSRFToken();

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRF-Token": getCookie("csrf_token"),
      ...getAuthHeader(),
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Failed to upload image");
  return data;
};

// Comments API
export const apiCreateComment = (articleId, name, email, content) =>
  fetchAPI("/comments", {
    method: "POST",
    body: JSON.stringify({ article_id: articleId, author_name: name, author_email: email, content }),
  });

export const apiGetAdminComments = () => fetchAPI("/comments");
export const apiUpdateCommentStatus = (id, status) => fetchAPI(`/comments/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
export const apiDeleteComment = (id) => fetchAPI(`/comments/${id}`, { method: "DELETE" });

// Auth API
export const apiLogin = (email, password) =>
  fetchAPI("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const apiRegister = (name, email, password) =>
  fetchAPI("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

export const apiLogout = () => fetchAPI("/logout", { method: "POST" });
export const apiGetMe = () => fetchAPI("/me");
export const apiForgotPassword = (email) => fetchAPI("/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
export const apiResetPassword = (token, password) => fetchAPI("/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
