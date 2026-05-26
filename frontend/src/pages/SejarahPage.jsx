import { useLang } from "../context/LangContext";

export default function SejarahPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="news-divider-bold mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-6">{t("nav.sejarah")}</h1>
        <div className="bg-white border border-surface-200 p-6 prose-article">
          <h2>Sejarah Singkat dan Dinamika Paguyuban KBB Sadunia</h2>
          <p>
            Kerukunan Bubuhan Banjar (KBB) Sadunia didirikan sebagai wadah silaturahmi, pelestarian budaya, 
            dan penguatan tali persaudaraan masyarakat Banjar di mana pun mereka berada, baik di dalam negeri maupun di mancanegara.
          </p>
          <h3>Latar Belakang</h3>
          <p>
            Masyarakat Banjar dikenal sebagai komunitas yang gemar merantau (madam) namun tetap memegang teguh adat istiadat 
            dan nilai-nilai luhur budaya leluhurnya. KBB Sadunia hadir untuk menyatukan berbagai paguyuban Banjar yang tersebar di seluruh dunia.
          </p>
          <div className="bg-surface-50 p-4 border-l-4 border-primary-600 mt-4 mb-4">
            <p className="font-medium text-surface-800 m-0">
              "Bausaha, Bagawi, Baimbai, Bapandir — Semangat kebersamaan urang Banjar dimana haja."
            </p>
          </div>
          <p>
            Untuk informasi lebih lengkap, Anda dapat mengunduh dokumen resmi sejarah kami.
          </p>
        </div>
      </div>
    </div>
  );
}
