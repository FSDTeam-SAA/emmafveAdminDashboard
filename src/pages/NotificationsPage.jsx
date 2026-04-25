import React, { useEffect, useState } from "react";
import { useLang } from "../context/LanguageContext";
import api from "../utils/api";

import ConfirmModal from "../components/common/ConfirmModal";

const NotifItem = React.memo(({ icon, title, sub, stats, date, isRead, onClick }) => (
  <div 
    onClick={onClick}
    className={`border rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer ${isRead ? 'bg-[#fcfaf7] border-[#e8ddd0] opacity-80' : 'bg-white border-[#8B6914] shadow-sm hover:shadow-md'}`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${isRead ? 'bg-[#e8ddd0]' : 'bg-[#8B6914] text-white'}`}>
        {icon || "🔔"}
      </div>
      <div>
        <h4 className={`text-sm ${isRead ? 'font-medium text-[#5a4a3a]' : 'font-bold text-[#3a2a1a]'}`}>{title}</h4>
        <p className="text-[10px] text-[#9a8a7a] line-clamp-1">{sub}</p>
        {date && <p className="text-[8px] text-[#c8b898] italic">{new Date(date).toLocaleString()}</p>}
      </div>
    </div>
    <div className="text-right flex flex-col items-end gap-1">
      {!isRead && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
      {stats && (
        <>
          <p className="text-[10px] text-[#9a8a7a] font-bold">{stats.sent} envois \u00B7 Ouverture {stats.open}%</p>
          <p className="text-[10px] text-[#9a8a7a] font-bold">Clics {stats.clicks}%</p>
        </>
      )}
    </div>
  </div>
));

export default function NotificationsPage() {
  const { t } = useLang();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [viewMode, setViewMode] = useState("my");

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const endpoint = viewMode === "all" 
          ? "/notifications/get-all-admin-notifications" 
          : "/notifications/get-my-notifications";
        const res = await api.get(endpoint);
        if (res.data.status === "ok") {
          setHistory(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [viewMode]);

  const getEmoji = (type) => {
    switch (type) {
      case "points_earned": return "💰";
      case "new_mission": return "🎯";
      case "report_update": return "📍";
      default: return "🔔";
    }
  };

  const handleNotifClick = async (notif) => {
    setSelectedNotif(notif);
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/mark-as-read/${notif._id}`);
        setHistory((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
  };

  return (
    <div className="p-5 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔔</span>
          <div>
            <h2 className="text-xl font-bold text-[#3a2a1a]">{t.notifTitle}</h2>
            <p className="text-[11px] text-[#9a8a7a]">{t.notifSub}</p>
          </div>
        </div>
        <button className="bg-[#8B6914] text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-[#6a5010] transition-colors">
          + Envoyer une alerte
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Create Alert Form */}
        <div className="col-span-3 bg-white rounded-xl border border-[#e8ddd0] p-6 flex flex-col gap-5">
           <h3 className="font-bold text-[#3a2a1a] text-xs flex items-center gap-2">
             <span>📣</span> {t.createAlert}
           </h3>
           <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                 <label className="text-[9px] font-bold text-[#9a8a7a] uppercase">{t.geoTarget}</label>
                 <select className="bg-[#fcfaf7] border border-[#e8ddd0] rounded px-3 py-2 text-xs text-[#3a2a1a] outline-none">
                    <option>Toute la France</option>
                    <option>Provence-Alpes-C\u00F4te d'Azur</option>
                 </select>
              </div>
              <div className="flex flex-col gap-1.5">
                 <label className="text-[9px] font-bold text-[#9a8a7a] uppercase">{t.userType}</label>
                 <select className="bg-[#fcfaf7] border border-[#e8ddd0] rounded px-3 py-2 text-xs text-[#3a2a1a] outline-none">
                    <option>Tous</option>
                    <option>Propri\u00E9taires</option>
                 </select>
              </div>
              <div className="flex flex-col gap-1.5">
                 <label className="text-[9px] font-bold text-[#9a8a7a] uppercase">{t.message}</label>
                 <textarea 
                    placeholder="Saisissez votre message d'alerte..."
                    className="bg-[#fcfaf7] border border-[#e8ddd0] rounded px-3 py-2 text-xs text-[#3a2a1a] outline-none h-32 resize-none"
                 />
              </div>
              <button className="bg-[#8B6914] text-white text-[11px] font-bold py-3 rounded-lg hover:bg-[#6a5010] transition-colors flex items-center justify-center gap-2">
                 <span>🚀</span> {t.sendAlert}
              </button>
           </div>
        </div>

        {/* History Card */}
        <div className="col-span-2 bg-white rounded-xl border border-[#e8ddd0] p-6 flex flex-col gap-5">
           <div className="flex items-center justify-between">
             <h3 className="font-bold text-[#3a2a1a] text-xs flex items-center gap-2">
               <span>📋</span> {t.notifHistory}
             </h3>
             <div className="flex gap-1 bg-[#fcfaf7] border border-[#e8ddd0] p-1 rounded-lg">
               <button
                 onClick={() => setViewMode("my")}
                 className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${viewMode === "my" ? "bg-[#8B6914] text-white shadow-sm" : "text-[#9a8a7a] hover:text-[#3a2a1a]"}`}
               >
                 My Alerts
               </button>
               <button
                 onClick={() => setViewMode("all")}
                 className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${viewMode === "all" ? "bg-[#8B6914] text-white shadow-sm" : "text-[#9a8a7a] hover:text-[#3a2a1a]"}`}
               >
                 All System
               </button>
             </div>
           </div>
           
           <div className="flex flex-col gap-3">
              {history.map((item) => (
                <NotifItem 
                  key={item._id} 
                  icon={getEmoji(item.type)}
                  title={item.title}
                  sub={item.description}
                  date={item.createdAt}
                  isRead={item.isRead}
                  onClick={() => handleNotifClick(item)}
                />
              ))}
              {history.length === 0 && !loading && (
                <p className="text-[10px] text-[#9a8a7a] text-center py-8 italic">{t.noNotifHistory}</p>
              )}
           </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedNotif && (
        <ConfirmModal
          isOpen={!!selectedNotif}
          onClose={() => setSelectedNotif(null)}
          title="Notification Details"
          message={
            <div className="flex flex-col gap-4 mt-2 text-left">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B6914] to-[#c0501a] flex items-center justify-center text-3xl shadow-lg shrink-0 text-white">
                  {getEmoji(selectedNotif.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#3a2a1a] text-lg leading-tight">{selectedNotif.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-[#f5f0e8] text-[#8B6914] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      {selectedNotif.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-[#9a8a7a]">
                      {new Date(selectedNotif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#fcfaf7] border border-[#e8ddd0] p-4 rounded-xl">
                <h4 className="text-[10px] font-bold text-[#9a8a7a] uppercase mb-1">Message</h4>
                <p className="text-sm text-[#5a4a3a] leading-relaxed whitespace-pre-wrap">
                  {selectedNotif.description}
                </p>
              </div>

              {selectedNotif.user && typeof selectedNotif.user === 'object' && (
                <div className="bg-[#f5f0e8] p-3 rounded-xl border border-[#e8ddd0]">
                   <h4 className="text-[10px] font-bold text-[#9a8a7a] uppercase mb-1">Target Recipient</h4>
                   <p className="text-xs text-[#3a2a1a] font-medium">
                     {selectedNotif.user.firstName} {selectedNotif.user.lastName} 
                     <span className="text-[#9a8a7a] font-normal ml-1">({selectedNotif.user.email})</span>
                   </p>
                   <span className="bg-white px-2 py-0.5 rounded text-[9px] mt-1 inline-block border border-[#e8ddd0] text-[#9a8a7a]">
                     Role: {selectedNotif.user.role}
                   </span>
                </div>
              )}
            </div>
          }
          confirmText="Close"
          onConfirm={() => setSelectedNotif(null)}
          hideCancel={true}
        />
      )}
    </div>
  );
}
