import React, { useEffect, useState, useCallback } from "react";
import { useLang } from "../context/LanguageContext";
import api from "../utils/api";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import CRUDModal from "../components/common/CRUDModal";
import FilterBar from "../components/common/FilterBar";
import StatusBadge from "../components/common/StatusBadge";
import { toast } from "react-toastify";
import ConfirmModal from "../components/common/ConfirmModal";

const MapPin = ({ top, left, type, label }) => (
  <div 
    className="absolute cursor-pointer drop-shadow-lg transition-all hover:scale-125 z-10 group"
    style={{ top, left }}
  >
    <div className="bg-white px-2 py-1 rounded shadow-sm border border-[#e8ddd0] text-[8px] font-bold absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
      {label}
    </div>
    <span className="text-xl">{type === 'collection_point' ? '🛒' : '🏠'}</span>
  </div>
);

export default function CollectionPointsPage() {
  const { t } = useLang();
  const [points, setPoints] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    status: "all",
    search: "",
    sortBy: "date",
    sort: "descending"
  });

  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const q = { ...queryParams, type: "collection_point" };
      if (q.status === "all") delete q.status;
      const queryString = new URLSearchParams(q).toString();
      
      const res = await api.get(`/partner-ads/get-all-partner-ads?${queryString}`);
      if (res.data.status === "ok") {
        setPoints(res.data.data || []);
        setMeta(res.data.meta);
      }
    } catch (err) {
      console.error("Failed to fetch collection points", err);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAdd = () => {
    setEditingPoint(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (point) => {
    setEditingPoint(point);
    setIsModalOpen(true);
  };

  const handleOpenView = async (id) => {
    try {
      const res = await api.get(`/partner-ads/get-single-partner-ad/${id}`);
      if (res.data.status === "ok") {
        setSelectedPoint(res.data.data);
        setIsViewModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to load details", err);
    }
  };

  const handleSubmit = async (formData) => {
    setModalLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined) data.append(key, formData[key]);
      });

      if (editingPoint) {
        await api.patch(`/partner-ads/update-partner-ad/${editingPoint._id}`, data);
      } else {
        // Backend expects specific create-collection-point route for partners
        // If admin, we might need a general route or use the same one if admin has partner role
        await api.post("/partner-ads/create-collection-point", data);
      }
      setIsModalOpen(false);
      toast.success(editingPoint ? "Collection point updated" : "Collection point created");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Collection Point",
      message: "Are you sure you want to delete this collection point?",
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await api.delete(`/partner-ads/delete-partner-ad/${id}`);
          toast.success("Collection point deleted successfully");
          fetchData();
        } catch (err) {
          toast.error(err.response?.data?.message || "Delete failed.");
        } finally {
          setConfirmLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const columns = [
    {
      header: t.point || "Point",
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#8B6914] flex items-center justify-center text-white text-xs font-bold shrink-0">
             🛒
          </div>
          <div className="flex flex-col">
             <span className="font-bold text-[#3a2a1a]">{p.title}</span>
             <span className="text-[10px] text-[#9a8a7a] truncate max-w-[150px]">{p.address}</span>
          </div>
        </div>
      )
    },
    { 
      header: t.partner || "Partner", 
      cell: (p) => p.partner?.company || p.partner?.firstName || 'N/A'
    },
    {
      header: t.statusLabel || "STATUS",
      cell: (p) => <StatusBadge status={p.status} />
    },
    {
      header: t.actionsLabel || "ACTIONS",
      align: "right",
      cell: (p) => (
        <div className="flex gap-1 justify-end">
          <button 
            onClick={() => handleOpenView(p._id)}
            className="bg-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1 rounded hover:bg-blue-200 transition-colors"
          >
            {t.viewBtn || "View"}
          </button>
          <button 
            onClick={() => handleOpenEdit(p)}
            className="bg-orange-100 text-orange-600 text-[10px] font-bold px-3 py-1 rounded hover:bg-orange-200 transition-colors"
          >
            {t.editBtn}
          </button>
          <button 
            onClick={() => handleDelete(p._id)}
            className="bg-red-100 text-red-600 text-[10px] font-bold px-3 py-1 rounded hover:bg-red-200 transition-colors"
          >
            {t.deleteBtn}
          </button>
        </div>
      )
    }
  ];

  const pointFields = [
    { name: "title", label: "Name", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "address", label: "Full Address", required: true },
    { name: "image", label: "Photo", type: "file" },
  ];

  return (
    <div className="p-5 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📍</span>
          <div>
            <h2 className="text-xl font-bold text-[#3a2a1a]">{t.collectionPointsTitle}</h2>
            <p className="text-[11px] text-[#9a8a7a]">{t.collectionPointsSub}</p>
          </div>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-[#8B6914] text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-[#6a5010] transition-colors flex items-center gap-2"
        >
          <span>+</span> {t.addPoint}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Map View */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-[#e8ddd0] p-4 relative h-[450px] shadow-sm">
          <div className="absolute inset-4 rounded-xl overflow-hidden bg-[#f5f0e8] border border-[#e8ddd0]/50 shadow-inner">
            {/* Mock Map Texture */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[#e8d5b0]/20 to-[#c8a87a]/10"></div>
            
            {/* Map Labels/Features (SVG) */}
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 500 300">
               <path d="M0 100 Q150 80 250 120 T500 90" stroke="#8B6914" fill="none" strokeWidth="20" className="opacity-10" />
               <path d="M100 0 Q120 150 80 300" stroke="#8B6914" fill="none" strokeWidth="15" className="opacity-10" />
            </svg>

            {/* Dynamic Map Pins */}
            {!loading && points.map((p, i) => (
               <MapPin 
                 key={p._id} 
                 top={`${20 + (i * 15) % 60}%`} 
                 left={`${10 + (i * 25) % 80}%`} 
                 type="collection_point" 
                 label={p.title} 
               />
            ))}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm">
                <div className="w-8 h-8 border-4 border-[#8B6914] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur shadow-lg px-4 py-2 rounded-xl text-[10px] font-extrabold text-[#3a2a1a] border border-[#e8ddd0] flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               {meta?.total || 0} {t.activePointsLabel || "points de collecte actifs"}
            </div>
          </div>
        </div>

        {/* List View */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#e8ddd0] overflow-hidden flex flex-col shadow-sm">
           <div className="p-4 border-b border-[#e8ddd0] bg-[#fcfaf7] flex items-center justify-between">
              <h3 className="font-bold text-[#3a2a1a] text-xs flex items-center gap-2">
                <span>📜</span> {t.pointsList}
              </h3>
              <span className="text-[10px] font-bold text-[#9a8a7a]">{meta?.total || 0} Total</span>
           </div>
           
           <FilterBar 
             onSearch={(val) => setQueryParams(p => p.search === val ? p : { ...p, search: val, page: 1 })}
             onFilterChange={(name, val) => setQueryParams(p => p[name] === val ? p : { ...p, [name]: val, page: 1 })}
             onSortChange={(sortBy, sort) => setQueryParams(p => p.sortBy === sortBy && p.sort === sort ? p : { ...p, sortBy, sort, page: 1 })}
             filters={[
               {
                 name: "status",
                 label: t.allStatuses || "All statuses",
                 options: [
                   { label: "Active", value: "active" },
                   { label: "Inactive", value: "inactive" }
                 ]
               }
             ]}
             sortOptions={[
               { label: t.dateDesc || "Date (Newest)", value: "date:descending" },
               { label: t.dateAsc || "Date (Oldest)", value: "date:ascending" },
               { label: t.nameAsc || "Name (A-Z)", value: "title:ascending" },
               { label: t.nameDesc || "Name (Z-A)", value: "title:descending" }
             ]}
           />
           
           <DataTable 
             columns={columns}
             data={points}
             loading={loading}
             skeletonCount={5}
             emptyMessage="No collection points found."
           />

           <div className="p-4 mt-auto border-t border-[#e8ddd0]">
             <Pagination meta={meta} onPageChange={(page) => setQueryParams(p => ({ ...p, page }))} />
           </div>
        </div>
      </div>

      <CRUDModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPoint ? "Edit Collection Point" : "Add New Point"}
        fields={pointFields}
        initialData={editingPoint}
        onSubmit={handleSubmit}
        loading={modalLoading}
      />

      {isViewModalOpen && selectedPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-[#f0e8d8] flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#3a2a1a] flex items-center gap-2">
                <span>🛒</span> Détails: {selectedPoint.title}
              </h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-[#9a8a7a] hover:text-[#3a2a1a] transition-colors p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-[#3a2a1a] border-b pb-2">Informations Générales</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-[#9a8a7a]">Titre:</span><span className="font-medium text-[#3a2a1a]">{selectedPoint.title}</span>
                    <span className="text-[#9a8a7a]">Statut:</span>
                    <span className="font-bold uppercase text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full w-fit">{selectedPoint.status}</span>
                    <span className="text-[#9a8a7a]">Adresse:</span><span className="font-medium text-[#3a2a1a] truncate" title={selectedPoint.address}>{selectedPoint.address}</span>
                    <span className="text-[#9a8a7a]">Date:</span><span className="font-medium text-[#3a2a1a]">{new Date(selectedPoint.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-[#3a2a1a] border-b pb-2">Partenaire</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#8B6914] text-white flex items-center justify-center font-bold overflow-hidden border border-[#e8ddd0]">
                      {(selectedPoint.partner?.company?.[0] || selectedPoint.partner?.firstName?.[0] || 'P').toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-[#3a2a1a]">{selectedPoint.partner?.company || selectedPoint.partner?.firstName}</span>
                      <span className="text-xs text-[#9a8a7a]">{selectedPoint.partner?.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 bg-[#f5f0e8] p-4 rounded-xl">
                <h3 className="font-bold text-[#3a2a1a] text-sm">Description</h3>
                <p className="text-sm text-[#5a4a3a] leading-relaxed whitespace-pre-wrap">{selectedPoint.description || t.noDescription}</p>
              </div>

              {selectedPoint.photo?.secure_url && (
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-[#3a2a1a] border-b pb-2">Photo</h3>
                  <img src={selectedPoint.photo.secure_url} alt="Point" className="w-full max-h-64 object-cover rounded-lg border border-[#e8ddd0] shadow-sm" />
                </div>
              )}

              {selectedPoint.location && selectedPoint.location.coordinates && (
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-[#3a2a1a] border-b pb-2">Localisation</h3>
                  <p className="text-sm text-[#5a4a3a] mb-2">📍 {selectedPoint.location.address || selectedPoint.address}</p>
                  <div className="w-full h-64 bg-gray-200 rounded-xl overflow-hidden border border-[#e8ddd0]">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }} 
                      loading="lazy" 
                      allowFullScreen 
                      src={`https://maps.google.com/maps?q=${selectedPoint.location.coordinates[1]},${selectedPoint.location.coordinates[0]}&hl=fr;z=14&output=embed`}
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onClose={() => !confirmLoading && setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        loading={confirmLoading}
      />
    </div>
  );
}
