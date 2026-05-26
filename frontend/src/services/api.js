const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:8000/api");

function getAuthHeader() {
  // Authentication is now handled automatically via HTTPOnly cookie
  return {};
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return "";
}

export async function fetchAPI(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    "X-CSRF-Token": getCookie("csrf_token"),
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const data = await response.json();

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

// Comments API
export const apiCreateComment = (articleId, name, email, content) => 
  fetchAPI("/comments", {
    method: "POST",
    body: JSON.stringify({ article_id: articleId, author_name: name, author_email: email, content }),
  });

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
