import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const titles = {
  "/": "HuluSungai News — Portal Berita & Artikel Perkumpulan Hulu Sungai",
  "/terkini": "Berita Terkini — HuluSungai News",
  "/profil": "Profil Organisasi — Perkumpulan Hulu Sungai",
  "/program": "Program Kami — Perkumpulan Hulu Sungai",
  "/struktur": "Struktur Organisasi — Perkumpulan Hulu Sungai",
  "/galeri": "Galeri Foto & Video — Perkumpulan Hulu Sungai",
  "/kalender": "Kalender Acara — Perkumpulan Hulu Sungai",
  "/kontak": "Hubungi Kami — Perkumpulan Hulu Sungai",
  "/donasi": "Donasi — Perkumpulan Hulu Sungai",
  "/auth": "Masuk / Daftar — HuluSungai News",
  "/about": "Tentang Redaksi — HuluSungai News",
  "/latar-belakang": "Latar Belakang — Perkumpulan Hulu Sungai",
  "/kebijakan-privasi": "Kebijakan Privasi — Perkumpulan Hulu Sungai",
};

export default function PageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = titles[pathname] || "HuluSungai News — Portal Berita & Artikel";
    // Schema.org JSON-LD for SEO
    let schema = document.getElementById("schema-jsonld");
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "schema-jsonld";
      schema.type = "application/ld+json";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Perkumpulan Hulu Sungai",
      url: "https://hulusungai.or.id",
      logo: "https://hulusungai.or.id/logo.png",
      description: "Portal berita dan artikel terlengkap seputar Hulu Sungai, Kalimantan Selatan.",
      address: { "@type": "PostalAddress", addressLocality: "Barabai", addressRegion: "Kalimantan Selatan", addressCountry: "ID" },
      sameAs: ["https://facebook.com/hulusungai", "https://twitter.com/hulusungai", "https://instagram.com/hulusungai"],
    });
  }, [pathname]);
  return null;
}
