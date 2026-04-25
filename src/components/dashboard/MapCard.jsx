import { useLang } from "../../context/LanguageContext";
import { useEffect, useState } from "react";

// Pro-level dynamic imports for zero-crash loading
let MapContainer, TileLayer, Marker, Popup, L, useMap;

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 500);
  }, [map]);
  return null;
}

export default function MapCard({ data, total }) {
  const { t } = useLang();
  const [isReady, setIsReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter out invalid coordinates (0,0)
  const validReports = (data || []).filter(r => r.lat && r.lng && r.lat !== 0 && r.lng !== 0);

  // Cycle through reports every 10 seconds
  useEffect(() => {
    if (validReports.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % validReports.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [validReports.length]);

  const currentReport = validReports[activeIndex] || null;
  const latestLocation = currentReport ? currentReport.title : "Global Coverage";

  useEffect(() => {
    const initMap = async () => {
      try {
        const rl = await import("react-leaflet");
        const leaf = await import("leaflet");
        await import("leaflet/dist/leaflet.css");

        MapContainer = rl.MapContainer;
        TileLayer = rl.TileLayer;
        Marker = rl.Marker;
        Popup = rl.Popup;
        useMap = rl.useMap;
        L = leaf.default || leaf;

        // Custom High-Visibility Pulsing Marker
        L.PulsingIcon = L.divIcon({
          html: `<div class="marker-pin"></div><div class="marker-pulse"></div>`,
          className: "custom-pulsing-marker",
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        setIsReady(true);
      } catch (err) {
        console.error("Map initialization failed:", err);
      }
    };
    initMap();
  }, []);

  // Center on the currently active report in the cycle
  const center = currentReport ? [currentReport.lat, currentReport.lng] : [23.8103, 90.4125];

  if (!isReady) {
    return (
      <div className="bg-white rounded-xl p-4 border border-[#e8ddd0] h-[260px] animate-pulse">
        <div className="bg-[#f5f0e8] h-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-[#e8ddd0] relative overflow-hidden">
      {/* Left Status Bar Indicator */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${currentReport?.type === 'lost' ? 'bg-red-500' : 'bg-blue-500'}`} />

      <style>{`
        .custom-pulsing-marker { position: relative; }
        .marker-pin {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #ef4444;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
        }
        .marker-pulse {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.4);
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: map-ping 1.5s infinite;
          z-index: 1;
        }
        @keyframes map-ping {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
      `}</style>

      {/* Header with status label and animal info */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="bg-red-50 p-1.5 rounded-lg">
            <span className="text-red-500 text-lg leading-none">📍</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                {currentReport?.type || "Lost"} Report
              </span>
              <h2 className="text-[14px] font-bold text-[#3a2a1a] leading-tight transition-all duration-500">
                {currentReport?.title || "Animal"}
              </h2>
            </div>
            <p className="text-[11px] text-[#9a8a7a] font-medium leading-tight mt-0.5 ml-0.5">
              {currentReport?.address || "Location unknown"}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {validReports.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? "bg-[#8B6914] scale-125" : "bg-gray-300"}`} />
          ))}
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden h-48 border border-[#e8ddd0] z-[0]">
        <MapContainer
          key={currentReport?.id || "default"}
          center={center}
          zoom={14}
          scrollWheelZoom={false}
          zoomControl={true}
          className="h-full w-full"
        >
          <MapResizer />
          <TileLayer
            attribution='&copy; Google'
            url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          />

          {validReports.map((p, idx) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={L.PulsingIcon}
              opacity={idx === activeIndex ? 1 : 0.6}
            >
              <Popup offset={[0, -5]}>
                <div className="text-[11px] p-1 text-center">
                  <p className="font-bold text-[#3a2a1a] mb-1">{p.title}</p>
                  <p className="text-red-600 font-bold uppercase text-[9px]">{p.type}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
