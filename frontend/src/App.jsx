import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTitle from "./components/PageTitle";
import { CategoriesProvider } from "./context/CategoriesContext";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import TerkiniPage from "./pages/TerkiniPage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import ProfilPage from "./pages/ProfilPage";
import ProgramPage from "./pages/ProgramPage";
import StrukturPage from "./pages/StrukturPage";
import GaleriPage from "./pages/GaleriPage";
import CalendarPage from "./pages/CalendarPage";
import ContactPage from "./pages/ContactPage";
import DonasiPage from "./pages/DonasiPage";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/AboutPage";
import LatarBelakangPage from "./pages/LatarBelakangPage";
import KebijakanPage from "./pages/KebijakanPage";
import NotFoundPage from "./pages/NotFoundPage";
import SitemapPage from "./pages/SitemapPage";
import SejarahPage from "./pages/SejarahPage";
import HukumPage from "./pages/HukumPage";
import PelantikanPage from "./pages/PelantikanPage";
import OpiniPage from "./pages/OpiniPage";
import KegiatanKBBPage from "./pages/KegiatanKBBPage";
import AdministrasiPage from "./pages/AdministrasiPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageArticles from "./pages/admin/ManageArticles";
import ArticleEditor from "./pages/admin/ArticleEditor";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
      <CategoriesProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <PageTitle />
        {/* Skip to content - WCAG accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg text-sm font-semibold">
          Langsung ke konten utama
        </a>
        <Navbar />
        <main id="main-content" className="min-h-screen" role="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/terkini" element={<TerkiniPage />} />
            <Route path="/article/:slug" element={<ArticleDetailPage />} />
            <Route path="/kategori/:slug" element={<CategoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profil" element={<ProfilPage />} />
            <Route path="/program" element={<ProgramPage />} />
            <Route path="/struktur" element={<StrukturPage />} />
            <Route path="/galeri" element={<GaleriPage />} />
            <Route path="/kalender" element={<CalendarPage />} />
            <Route path="/kontak" element={<ContactPage />} />
            <Route path="/donasi" element={<DonasiPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/latar-belakang" element={<LatarBelakangPage />} />
            <Route path="/kebijakan-privasi" element={<KebijakanPage />} />
            <Route path="/sitemap" element={<SitemapPage />} />
            <Route path="/tentang/sejarah" element={<SejarahPage />} />
            <Route path="/tentang/susunan-pengurus" element={<HukumPage />} />
            <Route path="/tentang/pelantikan" element={<PelantikanPage />} />
            <Route path="/tentang/opini" element={<OpiniPage />} />
            <Route path="/tentang/kegiatan" element={<KegiatanKBBPage />} />
            <Route path="/tentang/administrasi" element={<AdministrasiPage />} />
            
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'editor', 'author']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/articles" element={<ManageArticles />} />
              <Route path="/admin/articles/create" element={<ArticleEditor />} />
              <Route path="/admin/articles/edit/:id" element={<ArticleEditor />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
      </CategoriesProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}
