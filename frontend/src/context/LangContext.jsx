import { createContext, useContext, useState, useCallback } from "react";

const translations = {
  id: {
    nav: { home: "Beranda", latest: "Terkini", about: "Tentang", sejarah: "Sejarah Pembentukan KBB Sadunia", hukum: "Dasar hukum dan Susunan Pengurus", pelantikan: "Kegiatan Pelantikan KBB Sadunia", opini: "Artikel dan Opini", kegiatan: "Kegiatan dan Gelaran KBB Sadunia", administrasi: "Administrasi dan Sekretariat", profile: "Profil", program: "Program", structure: "Struktur", gallery: "Galeri", calendar: "Kalender", contact: "Kontak", donate: "Donasi", login: "Masuk", register: "Daftar", search: "Cari berita..." },
    home: { breaking: "BREAKING", headline: "Berita Utama", trending: "Terpopuler", latest: "Berita Terkini", categories: "Kategori", readMore: "Selengkapnya", views: "dibaca", contact: "Hubungi Redaksi", contactDesc: "Punya informasi atau ingin mengirim artikel? Hubungi kami." },
    article: { relatedNews: "Berita Terkait", moreNews: "Berita Lainnya", share: "Bagikan Artikel", tags: "Tags", comments: "Komentar", writeComment: "Tulis komentar...", yourName: "Nama Anda", send: "Kirim Komentar", bookmark: "Simpan", bookmarked: "Tersimpan", copyLink: "Salin Link", fontSize: "Ukuran", readTime: "baca", readCount: "kali dibaca", justNow: "Baru saja", minutesAgo: "menit lalu", hoursAgo: "jam lalu", daysAgo: "hari lalu", photo: "Foto: Ilustrasi / HuluSungai News" },
    about: { title: "Tentang Perkumpulan Hulu Sungai", vision: "Visi", mission: "Misi", history: "Sejarah", values: "Nilai-nilai Kami" },
    program: { title: "Program Kami", desc: "Program-program unggulan Perkumpulan Hulu Sungai untuk masyarakat." },
    structure: { title: "Struktur Organisasi", desc: "Kepengurusan Perkumpulan Hulu Sungai periode 2024-2028." },
    gallery: { title: "Galeri", desc: "Dokumentasi kegiatan dan momen penting.", photos: "Foto", videos: "Video", all: "Semua" },
    calendar: { title: "Kalender Acara", desc: "Jadwal kegiatan dan acara mendatang.", upcoming: "Acara Mendatang", past: "Acara Selesai", register: "Daftar Acara", free: "Gratis", location: "Lokasi", time: "Waktu" },
    contact: { title: "Hubungi Kami", desc: "Jangan ragu untuk menghubungi kami.", name: "Nama Lengkap", email: "Email", subject: "Subjek", message: "Pesan", send: "Kirim Pesan", address: "Alamat", phone: "Telepon", success: "Pesan terkirim!" },
    donate: { title: "Donasi", desc: "Bantu kami mewujudkan program-program untuk masyarakat Hulu Sungai.", amount: "Jumlah Donasi", name: "Nama Donatur", email: "Email", message: "Pesan (opsional)", method: "Metode Pembayaran", submit: "Donasi Sekarang", midtrans: "Midtrans", paypal: "PayPal", transfer: "Transfer Bank", secure: "Pembayaran aman & terenkripsi", thanks: "Terima kasih atas donasi Anda!" },
    auth: { login: "Masuk", register: "Daftar", email: "Email", password: "Kata Sandi", confirmPassword: "Konfirmasi Kata Sandi", name: "Nama Lengkap", forgotPassword: "Lupa kata sandi?", noAccount: "Belum punya akun?", hasAccount: "Sudah punya akun?", loginBtn: "Masuk", registerBtn: "Daftar Akun", memberArea: "Area Anggota" },
    footer: { privacy: "Kebijakan Privasi", guidelines: "Pedoman Media Siber", disclaimer: "Disclaimer", followUs: "Ikuti Kami", navigation: "Navigasi", categories: "Kategori" },
    common: { backHome: "Kembali ke Beranda", notFound: "Halaman tidak ditemukan", loading: "Memuat..." },
  },
  en: {
    nav: { home: "Home", latest: "Latest", about: "About", sejarah: "History of Formation", hukum: "Legal Basis and Board Structure", pelantikan: "Inauguration Activities", opini: "Articles and Opinions", kegiatan: "Activities and Events", administrasi: "Administration and Secretariat", profile: "Profile", program: "Programs", structure: "Structure", gallery: "Gallery", calendar: "Calendar", contact: "Contact", donate: "Donate", login: "Login", register: "Register", search: "Search news..." },
    home: { breaking: "BREAKING", headline: "Top Stories", trending: "Trending", latest: "Latest News", categories: "Categories", readMore: "Read More", views: "views", contact: "Contact Us", contactDesc: "Have information or want to submit an article? Contact us." },
    article: { relatedNews: "Related News", moreNews: "More News", share: "Share Article", tags: "Tags", comments: "Comments", writeComment: "Write a comment...", yourName: "Your Name", send: "Submit Comment", bookmark: "Bookmark", bookmarked: "Bookmarked", copyLink: "Copy Link", fontSize: "Size", readTime: "read", readCount: "times read", justNow: "Just now", minutesAgo: "minutes ago", hoursAgo: "hours ago", daysAgo: "days ago", photo: "Photo: Illustration / HuluSungai News" },
    about: { title: "About Perkumpulan Hulu Sungai", vision: "Vision", mission: "Mission", history: "History", values: "Our Values" },
    program: { title: "Our Programs", desc: "Featured programs of Perkumpulan Hulu Sungai for the community." },
    structure: { title: "Organization Structure", desc: "Board of Perkumpulan Hulu Sungai period 2024-2028." },
    gallery: { title: "Gallery", desc: "Documentation of activities and important moments.", photos: "Photos", videos: "Videos", all: "All" },
    calendar: { title: "Event Calendar", desc: "Upcoming events and activities schedule.", upcoming: "Upcoming Events", past: "Past Events", register: "Register", free: "Free", location: "Location", time: "Time" },
    contact: { title: "Contact Us", desc: "Don't hesitate to reach out to us.", name: "Full Name", email: "Email", subject: "Subject", message: "Message", send: "Send Message", address: "Address", phone: "Phone", success: "Message sent!" },
    donate: { title: "Donate", desc: "Help us realize programs for the Hulu Sungai community.", amount: "Donation Amount", name: "Donor Name", email: "Email", message: "Message (optional)", method: "Payment Method", submit: "Donate Now", midtrans: "Midtrans", paypal: "PayPal", transfer: "Bank Transfer", secure: "Secure & encrypted payment", thanks: "Thank you for your donation!" },
    auth: { login: "Login", register: "Register", email: "Email", password: "Password", confirmPassword: "Confirm Password", name: "Full Name", forgotPassword: "Forgot password?", noAccount: "Don't have an account?", hasAccount: "Already have an account?", loginBtn: "Sign In", registerBtn: "Create Account", memberArea: "Member Area" },
    footer: { privacy: "Privacy Policy", guidelines: "Media Guidelines", disclaimer: "Disclaimer", followUs: "Follow Us", navigation: "Navigation", categories: "Categories" },
    common: { backHome: "Back to Home", notFound: "Page not found", loading: "Loading..." },
  },
};

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState("id");
  const t = useCallback((path) => {
    const keys = path.split(".");
    let val = translations[lang];
    for (const k of keys) { val = val?.[k]; }
    return val || path;
  }, [lang]);
  const toggleLang = () => setLang((l) => (l === "id" ? "en" : "id"));
  return <LangContext.Provider value={{ lang, setLang, t, toggleLang }}>{children}</LangContext.Provider>;
}

export function useLang() { return useContext(LangContext); }
