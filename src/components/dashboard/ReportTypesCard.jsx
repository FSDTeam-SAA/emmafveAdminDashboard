import { useLang } from "../../context/LanguageContext";

const BAR_COLORS = {
  red: "bg-red-600",
  green: "bg-green-500",
  teal: "bg-teal-600",
  blue: "bg-blue-500",
};

export default function ReportTypesCard({ data, total }) {
  const { t } = useLang();

  const getPct = (count) => {
    if (!total || !count) return 0;
    return Math.round((count / total) * 100);
  };

  const bars = [
    { labelKey: "lost", pct: getPct(data?.lost), color: "red" },
    { labelKey: "found", pct: getPct(data?.found), color: "green" },
    { labelKey: "sheltered", pct: getPct(data?.sheltered), color: "teal" },
    { labelKey: "injured", pct: getPct(data?.injured), color: "blue" },
  ];

  return (
    <div className="bg-white rounded-xl p-4 border border-[#e8ddd0]">
      <h3 className="text-[13px] font-bold text-[#3a2a1a] flex items-center gap-1.5 mb-4">
        📊 {t.reportTypes}
      </h3>
      <div className="flex flex-col gap-3">
        {bars.map((bar) => (
          <div key={bar.labelKey}>
            <div className="flex justify-between text-[11px] text-[#3a2a1a] mb-1">
              <span>{t[bar.labelKey]}</span>
              <span className="font-semibold">{bar.pct}%</span>
            </div>
            <div className="bg-[#f0e8d8] rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${BAR_COLORS[bar.color]} transition-all duration-700`}
                style={{ width: `${bar.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
