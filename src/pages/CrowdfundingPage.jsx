import React, { useState, useEffect } from "react";
import { useLang } from "../context/LanguageContext";
import api from "../utils/api";

const DonorRow = React.memo(({ donor, t }) => (
  <tr className="border-b border-[#f0e8d8] last:border-0 hover:bg-[#fcfaf7] transition-colors text-xs">
    <td className="py-4 px-4 font-bold text-[#3a2a1a]">{donor.user}</td>
    <td className="py-4 px-4 font-bold text-[#3a2a1a]">{donor.amount}\u20AC</td>
    <td className="py-4 px-4 text-[#3a2a1a]">{donor.counterpart}</td>
    <td className="py-4 px-4 text-[#9a8a7a]">{donor.date}</td>
    <td className="py-4 px-4">
      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${donor.status === "Confirmed" || donor.status === "Confirm\u00E9" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
        {donor.status}
      </span>
    </td>
    <td className="py-4 px-4">
      <div className="flex justify-end">
        <button className="bg-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1 rounded hover:bg-blue-200 transition-colors">{t.detailsBtn}</button>
      </div>
    </td>
  </tr>
));

export default function CrowdfundingPage() {
  const { t, lang } = useLang();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/crowdfunding");
        if (res.data.status === "ok") {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch crowdfunding stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const donors = [
    { user: "marie@email.fr", amount: "50", counterpart: "Pack Supporter", date: "13/04/26", status: lang === "fr" ? "Confirm\u00E9" : "Confirmed" },
    { user: "Anonyme", amount: "20", counterpart: "Don libre", date: "13/04/26", status: lang === "fr" ? "Confirm\u00E9" : "Confirmed" },
    { user: "thomas@email.fr", amount: "100", counterpart: "Pack Fondateur", date: "13/04/26", status: lang === "fr" ? "En attente" : "Pending" },
  ];

  return (
    <div className="p-5 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚀</span>
          <div>
            <h2 className="text-xl font-bold text-[#3a2a1a]">{t.crowdTitle}</h2>
            <p className="text-[11px] text-[#9a8a7a]">{t.crowdSub}</p>
          </div>
        </div>
        <button className="bg-[#8B6914] text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-[#6a5010] transition-colors flex items-center gap-2">
          <img src="https://www.ulule.com/favicon.ico" className="w-4 h-4 rounded" alt="Ulule" /> {t.viewOnUlule}
        </button>
      </div>

      {/* Main Campaign Card */}
      <div className="bg-white rounded-xl border border-[#e8ddd0] p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
            <div className="flex items-end gap-3">
               <span className="text-5xl font-bold text-[#3a2a1a]">{stats?.totalCollected?.toLocaleString() || 0}\u20AC</span>
               <span className="text-xl text-[#9a8a7a] mb-1.5">{t.of || "sur"} {stats?.goalAmount?.toLocaleString() || 0}\u20AC {t.goal || "goal"}</span>
            </div>
           {/* Progress Bar */}
           <div className="w-full h-8 bg-[#f5f0e8] rounded-full overflow-hidden relative border border-[#e8ddd0]">
              <div 
                className="h-full bg-[#8B6914] transition-all duration-1000 flex items-center justify-end px-3" 
                style={{ width: `${stats?.percentage || 0}%` }}
              >
                 <span className="text-white text-[10px] font-bold">{Math.round(stats?.percentage || 0)}%</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
           {[
             { label: t.donors, value: stats?.donorsCount || "0" },
             { label: t.averageBasket, value: "33,9\u20AC" },
             { label: t.remaining, value: "18j" },
             { label: t.left, value: `${(stats?.goalAmount || 0) - (stats?.totalCollected || 0)}\u20AC` },
           ].map((stat, i) => (
             <div key={i} className="bg-[#fcfaf7] rounded-xl p-4 border border-[#e8ddd0] flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-[#9a8a7a] uppercase tracking-widest">{stat.label}</span>
                <span className="text-2xl font-bold text-[#3a2a1a]">{stat.value}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Donors List Table */}
      <div className="bg-white rounded-xl border border-[#e8ddd0] overflow-hidden">
        <div className="p-4 border-b border-[#e8ddd0]">
          <h3 className="font-bold text-[#3a2a1a] text-xs flex items-center gap-2">
            <span>📜</span> {t.donorsList}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fcfaf7] border-b border-[#e8ddd0]">
                <th className="py-3 px-4 text-[10px] font-bold text-[#9a8a7a] tracking-widest">{t.donator}</th>
                <th className="py-3 px-4 text-[10px] font-bold text-[#9a8a7a] tracking-widest">{t.amount}</th>
                <th className="py-3 px-4 text-[10px] font-bold text-[#9a8a7a] tracking-widest">{t.counterpart}</th>
                <th className="py-3 px-4 text-[10px] font-bold text-[#9a8a7a] tracking-widest">{t.dateLabel || "DATE"}</th>
                <th className="py-3 px-4 text-[10px] font-bold text-[#9a8a7a] tracking-widest">{t.statusLabel || "STATUS"}</th>
                <th className="py-3 px-4 text-[10px] font-bold text-[#9a8a7a] tracking-widest text-right">{t.actionsLabel || "ACTIONS"}</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((d, i) => <DonorRow key={i} donor={d} t={t} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
