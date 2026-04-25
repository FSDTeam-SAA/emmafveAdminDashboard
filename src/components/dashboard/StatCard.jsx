import React from "react";

const StatCard = React.memo(({ label, value, sub, subType = "up", loading = false }) => {
  const subColors = {
    up: "text-green-600",
    down: "text-red-600",
    wait: "text-orange-500",
    neutral: "text-[#9a8a7a]",
  };

  const subIcons = {
    up: "▲",
    down: "▼",
    wait: "⏳",
    neutral: "▶",
  };

  if (loading || value.text === "...") {
    return (
      <div className="bg-white rounded-xl p-4 border border-[#e8ddd0] animate-pulse">
        <div className="h-2 bg-gray-100 rounded w-1/2 mb-3"></div>
        <div className="h-8 bg-gray-100 rounded w-3/4"></div>
        <div className="h-2 bg-gray-50 rounded w-1/3 mt-4"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-[#e8ddd0] hover:shadow-md transition-shadow">
      <p className="text-[9px] font-bold tracking-widest text-[#9a8a7a] uppercase mb-2">
        {label}
      </p>
      <p className={`text-3xl font-bold leading-none ${value.color}`}>
        {value.text}
      </p>
      {sub && (
        <p className={`text-[10px] mt-2 flex items-center gap-1 ${subColors[subType]}`}>
          <span>{subIcons[subType]}</span>
          {sub}
        </p>
      )}
    </div>
  );
});

export default StatCard;
