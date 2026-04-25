import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "../../context/LanguageContext";
import { socket } from "../../context/SocketContect";
import api from "../../utils/api";
import ProfileModal from "./ProfileModal";
import { toast } from "react-toastify";

const Topbar = React.memo(() => {
  const { lang, setLang, t } = useLang();
  const location = useLocation();

  const PAGE_TITLES = {
    "/dashboard": { title: t.overview, sub: t.dashboardSub },
    "/reports": { title: t.reports, sub: t.reportsSub },
    "/users": { title: t.users, sub: t.usersSub },
    "/partners": { title: t.partners, sub: t.partnersSub },
    "/missions": { title: t.localMissions, sub: t.missionsSub },
    "/collection-points": { title: t.collectionPoints, sub: t.collPointsSub },
    "/points": { title: t.pointsSystem, sub: t.pointsSub },
    "/items": { title: t.physicalItems, sub: t.itemsSub },
    "/donations": { title: t.donations, sub: t.donationsSub },
    "/validation-donations": { title: t.validationDonationsTitle || "Donation Validation", sub: t.valDonationsSub },
    "/crowdfunding": { title: t.crowdfunding, sub: t.crowdSub },
    "/analytics": { title: t.analytics, sub: t.analyticsSub },
    "/notifications": { title: t.notifications, sub: t.notifsSub },
    "/settings": { title: t.settings, sub: t.settingsSub },
  };

  const page = PAGE_TITLES[location.pathname] || { title: t.dashboard || "Dashboard", sub: "HESTEKA Admin" };

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("adminUser")); } catch { return null; }
  });

  useEffect(() => {
    const handleProfileUpdate = () => {
      try {
        const updatedUser = JSON.parse(localStorage.getItem("adminUser"));
        if (updatedUser) setUser(updatedUser);
      } catch (err) { }
    };
    window.addEventListener("user-profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("user-profile-updated", handleProfileUpdate);
  }, []);

  const initials = user
    ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase()
    : "A";

  // Notifications State
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get("/notifications/get-my-notifications?limit=10");
        if (res.data.status === "ok") {
          setNotifications(res.data.data);
          setUnreadCount(res.data.meta.unreadCount || 0);
        }
      } catch (err) {
        console.error("Failed to fetch personal notifications", err);
      }
    };
    fetchNotifs();
  }, []);

  // Listen to live socket events for Topbar dropdown
  useEffect(() => {
    const handleNewNotif = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification:new", handleNewNotif);
    return () => {
      socket.off("notification:new", handleNewNotif);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark as read API
  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.patch(`/notifications/mark-as-read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleProfileUpdate = async () => {
    // Refresh profile data globally after successful update
    try {
      const profileRes = await api.get("/user/get-my-profile");
      if (profileRes.data.status === "ok") {
        localStorage.setItem("adminUser", JSON.stringify(profileRes.data.data));
        setUser(profileRes.data.data);
        window.dispatchEvent(new Event("user-profile-updated"));
      }
    } catch (err) {
      console.error("Failed to refresh profile after update", err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e8ddd0] px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-[#3a2a1a]">{page.title}</h1>
        <p className="text-[11px] text-[#9a8a7a] mt-0.5">{page.sub}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <div className="flex gap-1 bg-[#f5f0e8] rounded-lg p-1">
          {["fr", "en"].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${lang === l
                  ? "bg-[#8B6914] text-white"
                  : "text-[#9a8a7a] hover:text-[#3a2a1a]"
                }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative text-[#3a2a1a] text-lg hover:opacity-80 transition-opacity p-1"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm border border-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Popup */}
          {showNotifs && (
            <div className="absolute top-10 right-0 w-80 bg-white border border-[#e8ddd0] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
              <div className="bg-[#f5f0e8] px-4 py-3 border-b border-[#e8ddd0] flex justify-between items-center">
                <h3 className="font-bold text-[#3a2a1a] text-sm">{t.notifications}</h3>
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifs(false)}
                  className="text-[10px] font-bold text-[#8B6914] hover:underline"
                >
                  {t.viewAll}
                </Link>
              </div>

              <div className="max-h-80 overflow-y-auto flex flex-col">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleMarkAsRead(notif._id, notif.isRead)}
                      className={`p-4 border-b border-[#f5f0e8] hover:bg-[#fcfaf7] cursor-pointer transition-colors ${!notif.isRead ? 'bg-orange-50/50' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-xs ${!notif.isRead ? 'font-bold text-[#3a2a1a]' : 'font-medium text-[#5a4a3a]'}`}>
                          {notif.title}
                        </h4>
                        {!notif.isRead && <span className="w-2 h-2 bg-[#8B6914] rounded-full shrink-0 mt-1"></span>}
                      </div>
                      <p className="text-[10px] text-[#9a8a7a] line-clamp-2 leading-relaxed">
                        {notif.description}
                      </p>
                      <span className="text-[9px] text-[#c8b898] mt-2 block">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-[#9a8a7a] text-xs">
                    {t.noNotifs}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full bg-[#8B6914] flex items-center justify-center text-white font-bold text-sm cursor-pointer select-none hover:ring-2 hover:ring-[#8B6914] transition-all overflow-hidden"
          title={user ? `Edit Profile: ${user.firstName} ${user.lastName}` : "Admin"}
          onClick={() => setIsProfileModalOpen(true)}
        >
          {user?.profileImage?.secure_url ? (
            <img src={user.profileImage.secure_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdate={handleProfileUpdate}
      />
    </header>
  );
});

export default Topbar;
