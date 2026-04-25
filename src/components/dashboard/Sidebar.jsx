import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useLang } from "../../context/LanguageContext";
import api from "../../utils/api";

const Sidebar = React.memo(() => {
  const { t } = useLang();
  const location = useLocation();
  const [stats, setStats] = React.useState(null);
  const [user, setUser] = React.useState(() => JSON.parse(localStorage.getItem("adminUser")) || { firstName: "Admin", lastName: "" });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/user/get-my-profile");
        if (res.data.status === "ok" && res.data.data) {
          setUser(res.data.data);
          localStorage.setItem("adminUser", JSON.stringify(res.data.data));
          window.dispatchEvent(new Event("user-profile-updated"));
        }
      } catch (err) {
        console.error("Failed to fetch admin profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");
    window.location.href = "/login";
  };

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        if (res.data.status === "ok") {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Sidebar stats fetch failed", err);
      }
    };
    fetchStats();

    // Refresh stats every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const navSections = (t, stats) => [
    {
      label: t.principal,
      items: [
        { icon: "🏠", key: "overview", path: "/dashboard", badge: null },
        { icon: "🚩", key: "reports", path: "/reports", badge: stats?.reports?.total > 0 ? stats.reports.total : null, badgeColor: "bg-red-600" },
        { icon: "👥", key: "users", path: "/users", badge: null },
        { icon: "🤝", key: "partners", path: "/partners", badge: stats?.partners?.pending > 0 ? stats.partners.pending : null, badgeColor: "bg-orange-500" },
      ],
    },
    {
      label: t.community,
      items: [
        { icon: "🗺️", key: "localMissions", path: "/missions", badge: null },
        { icon: "⭐", key: "collectionPoints", path: "/collection-points", badge: null },
      ],
    },
    {
      label: t.economy,
      items: [
        { icon: "\uD83D\uDED2", key: "shopifyProducts", path: "/shopify-products", badge: null },
        { icon: "\uD83D\uDCDD", key: "validation-donations", path: "/validation-donations", badge: stats?.donationProofs?.pending > 0 ? stats.donationProofs.pending : null, badgeColor: "bg-orange-500" },
        { icon: "\u2B50", key: "pointsSystem", path: "/points", badge: null },
        { icon: "\uD83D\uDECD", key: "physicalItems", path: "/items", badge: null },
        { icon: "\uD83C\uDF81", key: "donations", path: "/donations", badge: null },
        { icon: "\uD83D\uDE80", key: "crowdfunding", path: "/crowdfunding", badge: null },
      ],
    },
    {
      label: t.config,
      items: [
        { icon: "📊", key: "analytics", path: "/analytics", badge: null },
        { icon: "🔔", key: "notifications", path: "/notifications", badge: null },
        { icon: "⚙️", key: "settings", path: "/settings", badge: null },
      ],
    },
  ];

  const sections = navSections(t, stats);

  return (
    <aside className="fixed top-0 left-0 h-screen w-40 bg-[#3a2a1a] flex flex-col overflow-y-auto z-50">
      {/* Logo */}
      <div className="bg-[#2a1a0a] px-3 py-3 flex items-center gap-2">
        <span className="text-white font-bold text-base tracking-widest">HESTEKA</span>
        <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
          {t.admin}
        </span>
      </div>

      {/* User */}
      <div className="px-3 py-3 border-b border-[#5a4a3a]">
        <div className="w-8 h-8 rounded-full bg-[#8B6914] flex items-center justify-center text-white font-bold text-sm mb-1.5 uppercase overflow-hidden">
          {user?.profileImage?.secure_url ? (
            <img src={user.profileImage.secure_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            user?.firstName?.charAt(0) || "A"
          )}
        </div>
        <p className="text-white text-[12px] font-semibold truncate">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-[#a09080] text-[10px] capitalize">
          {user.role}
        </p>
      </div>

      {/* Nav */}
      {sections.map((section) => (
        <div key={section.label} className="py-2">
          <p className="text-[#a09080] text-[9px] font-bold tracking-widest px-3 py-1">
            {section.label}
          </p>
          {section.items.map((item) => (
            <Link
              to={item.path}
              key={item.key}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-[#c8b898] hover:bg-[#5a4a3a] hover:text-white transition-colors ${location.pathname === item.path ? "bg-[#8B6914] text-white" : ""
                }`}
            >
              <span className="text-sm w-4 text-center">{item.icon}</span>
              <span className="flex-1 text-left">{t[item.key]}</span>
              {item.badge && (
                <span
                  className={`${item.badgeColor} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      ))}
      {/* Logout */}
      <div className="mt-auto p-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-[12px] text-[#c8b898] border border-[#5a4a3a] rounded hover:bg-[#5a4a3a] hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {t.logout}
        </button>
      </div>
    </aside>
  );
});

export default Sidebar;

