import { useLang } from "../../context/LanguageContext";

const DOT_COLORS = {
  red: "bg-red-600",
  green: "bg-green-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
};

export default function ActivityCard({ data }) {
  const { t, lang } = useLang();

  const formatTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000); // seconds

    if (diff < 60) return lang === "fr" ? "À l'instant" : "Just now";
    if (diff < 3600) return lang === "fr" ? `Il y a ${Math.floor(diff / 60)} min` : `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return lang === "fr" ? `Il y a ${Math.floor(diff / 3600)}h` : `${Math.floor(diff / 3600)}h ago`;
    return then.toLocaleDateString();
  };

  const activities = (data || []).map(a => {
    let dot = "green";
    if (a.type === "report") dot = "red";
    if (a.type === "donation") dot = "blue";
    
    return {
      dot,
      name: a.user || null,
      text: a.text,
      time: formatTime(a.time)
    };
  });

  return (
    <div className="bg-white rounded-xl p-4 border border-[#e8ddd0]">
      <h3 className="text-[13px] font-bold text-[#3a2a1a] flex items-center gap-1.5 mb-3">
        ⚡ {t.recentActivity}
      </h3>
      <div className="flex flex-col gap-3">
        {activities.map((a, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span
              className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${DOT_COLORS[a.dot]}`}
            />
            <div>
              <p className="text-[11px] text-[#3a2a1a] leading-snug">
                {a.name && <strong>{a.name}</strong>}
                {a.name ? " — " : ""}
                {a.text}
              </p>
              <p className="text-[10px] text-[#9a8a7a] mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
