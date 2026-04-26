import React, { useEffect, useState, useCallback } from "react";
import { useLang } from "../context/LanguageContext";
import StatCard from "../components/dashboard/StatCard";
import api from "../utils/api";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import FilterBar from "../components/common/FilterBar";
import { toast } from "react-toastify";
import ConfirmModal from "../components/common/ConfirmModal";

export default function ReportsPage() {
  const { t } = useLang();
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    status: "all",
    species: "all",
    search: "",
    sortBy: "date",
    sort: "descending"
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const q = { ...queryParams };
      if (q.status === "all") delete q.status;
      if (q.species === "all") delete q.species;
      const queryString = new URLSearchParams(q).toString();

      const [reportsRes, statsRes] = await Promise.all([
        api.get(`/reports/get-all-reports?${queryString}`),
        api.get("/admin/stats/reports"),
      ]);

      if (reportsRes.data.status === "ok") {
        setReports(reportsRes.data.data || []);
        setMeta(reportsRes.data.meta);
      }
      if (statsRes.data.status === "ok") {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch reports data", err);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprovePoints = (reportId) => {
    setConfirmModal({
      isOpen: true,
      title: "Approuver les points",
      message: "Voulez-vous vraiment approuver les points pour ce signalement ?",
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          const res = await api.patch(`/admin/approve-report-points/${reportId}`);
          if (res.data.status === "ok") {
            toast.success("Points approuvés avec succès");
            fetchData();
          }
        } catch (err) {
          toast.error(err.response?.data?.message || "Erreur lors de l'approbation");
        } finally {
          setConfirmLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const openReportDetails = async (reportId) => {
    try {
      const res = await api.get(`/reports/get-single-report/${reportId}`);
      if (res.data.status === "ok") {
        setSelectedReport(res.data.data);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to fetch report details", err);
    }
  };

  const getEmoji = (type) => {
    const tp = type?.toLowerCase();
    if (tp?.includes("dog") || tp?.includes("chien")) return "🐕";
    if (tp?.includes("cat") || tp?.includes("chat")) return "🐈";
    return "🐾";
  };

  const columns = [
    {
      header: t.animal,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#f5f0e8] flex items-center justify-center text-xl overflow-hidden shrink-0 border border-[#e8ddd0]">
            {r.images?.[0]?.secure_url ? (
              <img src={r.images[0].secure_url} alt={r.animalName} className="w-full h-full object-cover" />
            ) : (
              getEmoji(r.species)
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#3a2a1a] truncate max-w-[150px]">{r.animalName || r.title || "N/A"}</span>
            <span className="text-[10px] text-[#9a8a7a]">{r.breed || "Inconnu"}</span>
          </div>
        </div>
      )
    },
    {
      header: t.type,
      cell: (r) => (
        <span className="flex items-center gap-1">
          {getEmoji(r.species)} {r.species}
        </span>
      )
    },
    {
      header: t.status,
      cell: (r) => {
        const statusColors = {
          lost: "bg-orange-100 text-orange-600",
          found: "bg-blue-100 text-blue-600",
          rescued: "bg-green-100 text-green-600",
          sighted: "bg-purple-100 text-purple-600",
        };
        return (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[r.status] || "bg-gray-100 text-gray-600"}`}>
            {r.status}
          </span>
        );
      }
    },
    { header: t.location, cell: (r) => <div className="max-w-[200px] truncate">{r.location?.address || "N/A"}</div> },
    {
      header: t.user,
      cell: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#8B6914] text-white flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0">
            {r.author?.profileImage?.secure_url ? (
              <img src={r.author.profileImage.secure_url} alt="author" className="w-full h-full object-cover" />
            ) : (
              (r.author?.firstName?.[0] || 'U').toUpperCase()
            )}
          </div>
          <span className="text-xs text-[#3a2a1a] font-medium">{`${r.author?.firstName || ''} ${r.author?.lastName || ''}`.trim() || 'N/A'}</span>
        </div>
      )
    },
    { header: t.date, cell: (r) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: "COMMENTAIRES",
      align: "center",
      cell: (r) => (
        <span className="text-[10px] font-bold bg-[#f5f0e8] text-[#8B6914] px-2 py-1 rounded-lg">
          {r.comments?.length || 0}
        </span>
      )
    },
    {
      header: t.actions,
      align: "right",
      cell: (r) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => openReportDetails(r._id)} className="bg-blue-100 text-blue-600 text-[10px] font-bold px-3 py-1 rounded hover:bg-blue-200 transition-colors">{t.viewBtn}</button>
          {r.status === "found" && (
            <button
              onClick={() => handleApprovePoints(r._id)}
              className="bg-green-100 text-green-600 text-[10px] font-bold px-3 py-1 rounded hover:bg-green-200 transition-colors"
            >
              {t.validateBtn}
            </button>
          )}
          <button
            onClick={() => {
              setConfirmModal({
                isOpen: true,
                title: "Delete Report",
                message: "Are you sure you want to delete this report? This action cannot be undone.",
                onConfirm: async () => {
                  setConfirmLoading(true);
                  try {
                    const res = await api.delete(`/reports/delete-report/${r._id}`);
                    if (res.data.status === "ok" || res.status === 200) {
                      toast.success("Report deleted successfully");
                      fetchData();
                    }
                  } catch (err) {
                    toast.error(err.response?.data?.message || "Failed to delete report");
                  } finally {
                    setConfirmLoading(false);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  }
                }
              });
            }}
            className="bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1 rounded hover:bg-red-100 transition-colors"
          >
            {t.deleteBtn}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="px-6 py-4 flex flex-col gap-4">
      {/* Stats */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-4 gap-3">
          <StatCard loading={loading} label={t.totalActive} value={{ text: stats?.total?.toLocaleString() || "0", color: "text-[#3a2a1a]" }} />
          <StatCard loading={loading} label={t.resolvedLabel} value={{ text: stats?.resolved?.toLocaleString() || "0", color: "text-[#3a2a1a]" }} />
          <StatCard loading={loading} label={t.pendingLabel} value={{ text: stats?.pending?.toLocaleString() || "0", color: "text-orange-500" }} />
          <StatCard loading={loading} label={t.resolutionRate} value={{ text: `${stats?.resolutionRate || 0}%`, color: "text-blue-600" }} />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-[#e8ddd0] overflow-hidden flex flex-col">
        <FilterBar
          onSearch={(val) => setQueryParams(p => p.search === val ? p : { ...p, search: val, page: 1 })}
          onFilterChange={(name, val) => setQueryParams(p => p[name] === val ? p : { ...p, [name]: val, page: 1 })}
          onSortChange={(sortBy, sort) => setQueryParams(p => p.sortBy === sortBy && p.sort === sort ? p : { ...p, sortBy, sort, page: 1 })}
          filters={[
            {
              name: "status",
              label: t.allStatuses || "All statuses",
              options: [
                { label: "Lost", value: "lost" },
                { label: "Found", value: "found" },
                { label: "Rescued", value: "rescued" },
                { label: "Sighted", value: "sighted" }
              ]
            },
            {
              name: "species",
              label: t.allSpecies || "All species",
              options: [
                { label: "Chien", value: "Dog" },
                { label: "Chat", value: "Cat" },
                { label: "Oiseau", value: "Bird" },
                { label: "Autre", value: "Other" }
              ]
            }
          ]}
          sortOptions={[
            { label: t.dateDesc || "Date (Newest)", value: "date:descending" },
            { label: t.dateAsc || "Date (Oldest)", value: "date:ascending" },
            { label: t.nameAsc || "Name (A-Z)", value: "name:ascending" },
            { label: t.nameDesc || "Name (Z-A)", value: "name:descending" }
          ]}
          actionButton={
            <button className="bg-[#8B6914] text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-[#6a5010] transition-colors flex items-center gap-2">
              <span>+</span> {t.createReport || "Create Report"}
            </button>
          }
        />

        <DataTable
          columns={columns}
          data={reports}
          loading={loading}
          emptyMessage={t.noReportsFound || "No reports found."}
        />

        <Pagination
          meta={meta}
          onPageChange={(page) => setQueryParams(p => ({ ...p, page }))}
        />
      </div>

      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-[#f0e8d8] flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#3a2a1a] flex items-center gap-2">
                <span>🐾</span> Détails du signalement: {selectedReport.title}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[#9a8a7a] hover:text-[#3a2a1a] transition-colors p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-[#3a2a1a] border-b pb-2">Informations sur l'animal</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-[#9a8a7a]">Titre:</span><span className="font-medium text-[#3a2a1a] truncate" title={selectedReport.title}>{selectedReport.title}</span>
                    <span className="text-[#9a8a7a]">Nom:</span><span className="font-medium text-[#3a2a1a]">{selectedReport.animalName}</span>
                    <span className="text-[#9a8a7a]">Espèce:</span><span className="font-medium text-[#3a2a1a]">{selectedReport.species}</span>
                    <span className="text-[#9a8a7a]">Race:</span><span className="font-medium text-[#3a2a1a]">{selectedReport.breed}</span>
                    <span className="text-[#9a8a7a]">Genre:</span><span className="font-medium text-[#3a2a1a]">{selectedReport.gender}</span>
                    <span className="text-[#9a8a7a]">Âge:</span><span className="font-medium text-[#3a2a1a]">{selectedReport.age}</span>
                    <span className="text-[#9a8a7a]">{t.statusLabel || "Status"}:</span>
                    <span className="font-bold uppercase text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full w-fit">{selectedReport.status}</span>
                    <span className="text-[#9a8a7a]">Puce:</span><span className="font-medium text-[#3a2a1a]">{selectedReport.hasMicrochip}</span>
                    <span className="text-[#9a8a7a]">Collier:</span><span className="font-medium text-[#3a2a1a]">{selectedReport.hasCollarOrHarness}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-[#3a2a1a] border-b pb-2">Auteur & Contact</h3>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#8B6914] text-white flex items-center justify-center font-bold overflow-hidden border border-[#e8ddd0]">
                      {selectedReport.author?.profileImage?.secure_url ? (
                        <img src={selectedReport.author.profileImage.secure_url} alt="author" className="w-full h-full object-cover" />
                      ) : (
                        (selectedReport.author?.firstName?.[0] || 'U').toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-[#3a2a1a]">{selectedReport.author?.firstName} {selectedReport.author?.lastName}</span>
                      <span className="text-xs text-[#9a8a7a]">{selectedReport.author?.email}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-[#9a8a7a]">Date:</span><span className="font-medium text-[#3a2a1a]">{new Date(selectedReport.eventDate).toLocaleDateString()}</span>
                    <span className="text-[#9a8a7a]">Téléphone:</span><span className="font-medium text-[#3a2a1a]">{selectedReport.isPhoneVisible ? selectedReport.contactPhone || 'N/A' : 'Masqué'}</span>
                    <span className="text-[#9a8a7a]">Email:</span><span className="font-medium text-[#3a2a1a]">{selectedReport.isEmailVisible ? selectedReport.contactEmail || selectedReport.author?.email : 'Masqué'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 bg-[#f5f0e8] p-4 rounded-xl">
                <h3 className="font-bold text-[#3a2a1a] text-sm">Description</h3>
                <p className="text-sm text-[#5a4a3a] leading-relaxed whitespace-pre-wrap">{selectedReport.description || t.noDescription}</p>
              </div>

              {selectedReport.images && selectedReport.images.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-[#3a2a1a] border-b pb-2">Photos</h3>
                  <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
                    {selectedReport.images.map((img, idx) => (
                      <img key={idx} src={img.secure_url} alt="Animal" className="w-32 h-32 object-cover rounded-lg border border-[#e8ddd0] shadow-sm" />
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.location && selectedReport.location.coordinates && (
                <div className="flex flex-col gap-3">
                  <h3 className="font-bold text-[#3a2a1a] border-b pb-2">Localisation</h3>
                  <p className="text-sm text-[#5a4a3a] mb-2">📍 {selectedReport.location.address}</p>
                  <div className="w-full h-64 bg-gray-200 rounded-xl overflow-hidden border border-[#e8ddd0]">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${selectedReport.location.coordinates[1]},${selectedReport.location.coordinates[0]}&hl=fr;z=14&output=embed`}
                    ></iframe>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <h3 className="font-bold text-[#3a2a1a] border-b pb-2">Commentaires ({selectedReport.comments?.length || 0})</h3>
                <div className="flex flex-col gap-3">
                  {selectedReport.comments && selectedReport.comments.length > 0 ? selectedReport.comments.map((comment) => (
                    <div key={comment._id} className="bg-[#fcfaf7] border border-[#e8ddd0] p-3 rounded-lg flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#8B6914] text-white flex items-center justify-center font-bold text-[10px] overflow-hidden">
                          {comment.author?.profileImage?.secure_url ? (
                            <img src={comment.author.profileImage.secure_url} alt="comment author" className="w-full h-full object-cover" />
                          ) : (
                            (comment.author?.firstName?.[0] || 'U').toUpperCase()
                          )}
                        </div>
                        <span className="font-bold text-xs text-[#3a2a1a]">{comment.author?.firstName} {comment.author?.lastName}</span>
                        <span className="text-[10px] text-[#9a8a7a] ml-auto">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-[#5a4a3a] pl-8">{comment.content}</p>
                      {comment.image && (
                        <img src={comment.image.secure_url} alt="comment attachment" className="w-20 h-20 object-cover rounded mt-2 ml-8" />
                      )}
                    </div>
                  )) : (
                    <p className="text-xs text-[#9a8a7a] italic">{t.noComments}</p>
                  )}
                </div>
              </div>
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
