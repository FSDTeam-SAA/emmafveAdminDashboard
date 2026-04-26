import React from "react";
import { useLang } from "../context/LanguageContext";

const AnalyticsCard = React.memo(({ label, value, sub, color }) => (
  <div className={`bg-white rounded-xl p-4 border border-[#e8ddd0] flex flex-col gap-1 relative overflow-hidden`}>
    <div className={`absolute left-0 top-0 w-1 h-full ${color}`}></div>
    <span className="text-[9px] font-bold text-[#9a8a7a] tracking-widest uppercase">{label}</span>
    <span className="text-2xl font-bold text-[#3a2a1a]">{value}</span>
    {sub && (
      <span className={`text-[10px] font-bold ${sub.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
        {sub.startsWith('+') ? '\u25B2' : '\u25BC'} {sub}
      </span>
    )}
  </div>
));

const ZoneRow = React.memo(({ label, percentage, color }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between text-[11px] font-bold text-[#3a2a1a]">
      <span>{label}</span>
      <span>{percentage}%</span>
    </div>
    <div className="w-full h-1.5 bg-[#f5f0e8] rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
    </div>
  </div>
));

export default function AnalyticsPage() {
  const { t } = useLang();

  const zones = [
    { label: "Provence-Alpes-C\u00F4te d'Azur", percentage: 38, color: "bg-orange-600" },
    { label: "\u00CEle-de-France", percentage: 24, color: "bg-green-600" },
    { label: "Occitanie", percentage: 18, color: "bg-blue-500" },
    { label: "Auvergne-Rh\u00F4ne-Alpes", percentage: 12, color: "bg-purple-600" },
  ];

  const chartMonths = [
    { month: "Jan", val: 30, color: "bg-[#e8d5b0]" },
    { month: "F\u00E9v", val: 45, color: "bg-[#d4b896]" },
    { month: "Mar", val: 70, color: "bg-[#c8a87a]" },
    { month: "Avr", val: 85, color: "bg-[#8B6914]" },
  ];

  return (
    <div className="px-6 py-4 flex flex-col gap-6">

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <AnalyticsCard label={t.sessionsMonth} value="8 420" sub="+18%" color="bg-green-500" />
        <AnalyticsCard label={t.retention} value="67%" sub="+5%" color="bg-blue-500" />
        <AnalyticsCard label={t.avgDuration} value="4m32s" color="bg-orange-500" />
        <AnalyticsCard label={t.conversion} value="12%" color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Reports Chart Card */}
        <div className="col-span-3 bg-white rounded-xl border border-[#e8ddd0] p-6 flex flex-col gap-6">
           <h3 className="font-bold text-[#3a2a1a] text-xs flex items-center gap-2">
             <span>📊</span> {t.reportsMonth}
           </h3>
           <div className="flex items-end justify-between h-[180px] px-4">
              {chartMonths.map((m, i) => (
                <div key={i} className="flex flex-col items-center gap-3 w-16">
                   <div className={`w-full ${m.color} rounded-t-lg transition-all duration-1000`} style={{ height: `${m.val}%` }}></div>
                   <span className="text-[10px] font-bold text-[#9a8a7a]">{m.month}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Zones Card */}
        <div className="col-span-2 bg-white rounded-xl border border-[#e8ddd0] p-6 flex flex-col gap-6">
           <h3 className="font-bold text-[#3a2a1a] text-xs flex items-center gap-2">
             <span>🗽</span> {t.activeZones}
           </h3>
           <div className="flex flex-col gap-5">
              {zones.map((z, i) => <ZoneRow key={i} {...z} />)}
           </div>
        </div>
      </div>
    </div>
  );
}
