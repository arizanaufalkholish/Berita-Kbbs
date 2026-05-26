import { events } from "../data/organization";
import { useLang } from "../context/LangContext";

export default function CalendarPage() {
  const { t } = useLang();
  const upcoming = events.filter((e) => e.upcoming);
  const past = events.filter((e) => !e.upcoming);

  const EventCard = ({ event, isPast }) => (
    <div className={`bg-white rounded-lg border border-surface-200 p-5 flex gap-4 hover:shadow-md transition-all ${isPast ? "opacity-70" : ""}`}>
      <div className="shrink-0 w-14 text-center">
        <div className={`rounded-lg p-2 ${isPast ? "bg-surface-100" : "bg-primary-50"}`}>
          <p className={`text-2xl font-bold ${isPast ? "text-surface-400" : "text-primary-700"}`}>{new Date(event.date).getDate()}</p>
          <p className={`text-[10px] font-semibold uppercase ${isPast ? "text-surface-400" : "text-primary-500"}`}>{new Date(event.date).toLocaleDateString("id-ID", { month: "short" })}</p>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary-100 text-primary-700">{event.type}</span>
          {event.free && <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">{t("calendar.free")}</span>}
        </div>
        <h3 className="font-bold text-surface-900 mb-1">{event.title}</h3>
        <p className="text-sm text-surface-500 mb-2">{event.desc}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-surface-400">
          <span>📍 {event.location}</span>
          <span>🕐 {event.time}</span>
        </div>
        {!isPast && (
          <button className="mt-3 px-4 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold hover:bg-primary-700 transition-colors">{t("calendar.register")}</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="news-divider-bold mb-4" />
      <h1 className="text-2xl font-bold text-surface-900 mb-1">{t("calendar.title")}</h1>
      <p className="text-surface-500 mb-8">{t("calendar.desc")}</p>

      <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">📅 {t("calendar.upcoming")}</h2>
      <div className="space-y-4 mb-10">
        {upcoming.map((e) => <EventCard key={e.id} event={e} isPast={false} />)}
      </div>

      <h2 className="text-lg font-bold text-surface-500 mb-4 flex items-center gap-2">📋 {t("calendar.past")}</h2>
      <div className="space-y-4">
        {past.map((e) => <EventCard key={e.id} event={e} isPast={true} />)}
      </div>
    </div>
  );
}
