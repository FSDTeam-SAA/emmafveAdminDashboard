import React from 'react';

const StatusToggle = ({ status, onToggle, options = [] }) => {
  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => status !== opt.value && onToggle(opt.value)}
          className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all ${
            status === opt.value 
              ? opt.activeClass || 'bg-green-100 text-green-600 border border-green-200' 
              : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default StatusToggle;
