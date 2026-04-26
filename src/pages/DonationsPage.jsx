import React, { useState, useEffect } from "react";
import { useLang } from "../context/LanguageContext";
import StatCard from "../components/dashboard/StatCard";
import api from "../utils/api";
import Pagination from "../components/common/Pagination";
import FilterBar from "../components/common/FilterBar";
import { toast } from "react-toastify";

const ReceiptModal = ({ donation, isOpen, onClose, t, isFiscal }) => {
  const [emailLoading, setEmailLoading] = useState(false);
  if (!isOpen || !donation) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    setEmailLoading(true);
    try {
      const res = await api.post(`/donations/${donation._id}/send-receipt`, { isFiscal });
      if (res.data.status === "ok" || res.data.success) {
        toast.success(t.receiptSentSuccess || "Receipt sent successfully to donor email!");
      }
    } catch (err) {
      console.error("Failed to send receipt email", err);
      toast.error(err.response?.data?.message || "Failed to send receipt email");
    } finally {
      setEmailLoading(false);
    }
  };

  const statusColor = donation.status === "completed" ? "text-green-600 border-green-600" : "text-orange-600 border-orange-600";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:bg-white print:p-0">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-[#e8ddd0] flex flex-col print:shadow-none print:border-none print:max-w-none print:w-full">
        {/* Modal Header - Hidden on print */}
        <div className="bg-[#fcfaf7] px-6 py-4 border-b border-[#e8ddd0] flex justify-between items-center print:hidden">
          <h3 className="font-bold text-[#3a2a1a] flex items-center gap-2 uppercase tracking-tight text-sm">
            <span>{isFiscal ? "📜" : "🧾"}</span> {isFiscal ? t.fiscalReceipt : t.receiptBtn}
          </h3>
          <button onClick={onClose} className="text-[#9a8a7a] hover:text-[#3a2a1a] transition-colors">✕</button>
        </div>

        {/* Receipt Content */}
        <div className="p-8 flex flex-col gap-8 bg-white relative overflow-hidden print:p-10">
          {/* Decorative receipt edge (top) */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-repeat-x print:hidden" style={{ backgroundImage: 'radial-gradient(circle, #fcfaf7 5px, transparent 5px)', backgroundSize: '15px 10px' }}></div>

          {/* Logo & Header */}
          <div className="flex flex-col items-center gap-2 border-b-2 border-dashed border-[#f0e8d8] pb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#3a2a1a] flex items-center justify-center text-white text-2xl font-black mb-2">H</div>
            <h1 className="text-2xl font-black text-[#3a2a1a] tracking-tighter">HESTEKA</h1>
            <p className="text-[10px] text-[#9a8a7a] font-bold uppercase tracking-widest">{isFiscal ? "Official Fiscal Receipt" : "Donation Receipt"}</p>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex justify-between border-b border-[#fcfaf7] py-2">
              <span className="text-[#9a8a7a] font-bold uppercase text-[10px]">{t.dateLabel}</span>
              <span className="text-[#3a2a1a] font-bold">{new Date(donation.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between border-b border-[#fcfaf7] py-2">
              <span className="text-[#9a8a7a] font-bold uppercase text-[10px]">RECEIPT ID</span>
              <span className="text-[#3a2a1a] font-mono text-[11px]">{donation.receiptId || (donation._id && typeof donation._id === 'string' ? donation._id.slice(-8).toUpperCase() : "N/A")}</span>
            </div>
            <div className="flex justify-between border-b border-[#fcfaf7] py-2">
              <span className="text-[#9a8a7a] font-bold uppercase text-[10px]">{t.donator}</span>
              <span className="text-[#3a2a1a] font-bold">{donation.donorName}</span>
            </div>
            <div className="flex justify-between border-b border-[#fcfaf7] py-2">
              <span className="text-[#9a8a7a] font-bold uppercase text-[10px]">EMAIL</span>
              <span className="text-[#3a2a1a] font-bold">{donation.donorEmail}</span>
            </div>
            <div className="flex justify-between border-b border-[#fcfaf7] py-2">
              <span className="text-[#9a8a7a] font-bold uppercase text-[10px]">{t.association}</span>
              <span className="text-[#3a2a1a] font-bold">{donation.association || "HESTEKA ASSOCIATION"}</span>
            </div>
            <div className="flex justify-between border-b border-[#fcfaf7] py-2">
              <span className="text-[#9a8a7a] font-bold uppercase text-[10px]">METHOD</span>
              <span className="text-[#3a2a1a] font-bold uppercase">{donation.method}</span>
            </div>
          </div>

          {/* Amount Section */}
          <div className="bg-[#fcfaf7] rounded-xl p-6 border-2 border-[#e8ddd0] flex flex-col items-center gap-1 my-2">
            <span className="text-[10px] font-bold text-[#9a8a7a] uppercase tracking-[0.2em]">{t.amount}</span>
            <span className="text-4xl font-black text-[#3a2a1a]">{donation.amount}€</span>
          </div>

          {/* Footer / Legal */}
          <div className="flex flex-col gap-4 mt-2">
            <p className="text-[10px] text-[#9a8a7a] leading-relaxed text-center italic">
              {isFiscal
                ? "This fiscal receipt is issued in accordance with current tax laws. It entitles the donor to a tax deduction for their charitable contribution."
                : "Thank you for your generous donation. Your support helps us continue our mission to help animals in need."}
            </p>

            <div className="flex justify-center gap-12 mt-4 grayscale print:opacity-100">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-20 h-10 rounded border-2 flex items-center justify-center text-[10px] font-black uppercase tracking-tighter rotate-[-12deg] ${statusColor}`}>
                  {donation.status}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 opacity-50">
                <div className="h-12 flex items-end text-[12px] font-serif text-[#3a2a1a]">Hesteka Team</div>
                <div className="w-20 h-[1px] bg-[#e8ddd0]"></div>
              </div>
            </div>
          </div>

          {/* Decorative receipt edge (bottom) */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-repeat-x print:hidden" style={{ backgroundImage: 'radial-gradient(circle, #fcfaf7 5px, transparent 5px)', backgroundSize: '15px 10px', transform: 'rotate(180deg)' }}></div>
        </div>

        {/* Modal Footer - Hidden on print */}
        <div className="px-6 py-4 bg-[#fcfaf7] border-t border-[#e8ddd0] flex gap-3 print:hidden">
          <button
            onClick={onClose}
            className="flex-1 border border-[#e8ddd0] text-[#3a2a1a] text-xs font-bold py-3 rounded-xl hover:bg-white transition-colors"
          >
            {t.closeBtn || "CLOSE"}
          </button>
          <button
            onClick={handleSendEmail}
            disabled={emailLoading}
            className="flex-1 bg-blue-600 text-white text-xs font-bold py-3 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {emailLoading ? "SENDING..." : <><span>📧</span> {t.emailReceipt || "EMAIL"}</>}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-[#3a2a1a] text-white text-xs font-bold py-3 rounded-xl hover:bg-[#2a1a0a] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#3a2a1a]/20"
          >
            <span>🖨️</span> {t.printBtn || "PRINT"}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed.inset-0, .fixed.inset-0 * {
            visibility: visible;
          }
          .fixed.inset-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: white !important;
            backdrop-filter: none !important;
          }
        }
      `}} />
    </div>
  );
};


const DonationDetailModal = ({ donation, isOpen, onClose, t }) => {
  if (!isOpen || !donation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#e8ddd0]">
        <div className="bg-[#fcfaf7] px-6 py-4 border-b border-[#e8ddd0] flex justify-between items-center">
          <h3 className="font-bold text-[#3a2a1a] flex items-center gap-2">
            <span>🧾</span> {t.donationDetailTitle || "DONATION DETAILS"}
          </h3>
          <button onClick={onClose} className="text-[#9a8a7a] hover:text-[#3a2a1a] transition-colors">✕</button>
        </div>

        <div className="p-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
          {/* Donor Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-[#9a8a7a] uppercase tracking-wider">{t.donator}</span>
              <span className="text-sm font-bold text-[#3a2a1a]">{donation.donorName}</span>
              <span className="text-[10px] text-[#9a8a7a]">{donation.donorEmail}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-[#9a8a7a] uppercase tracking-wider">METHOD</span>
              <span className="text-sm font-bold text-[#3a2a1a] uppercase">{donation.method}</span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-[#fcfaf7] rounded-xl p-4 border border-[#e8ddd0] grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-[#9a8a7a] uppercase tracking-wider">{t.amount}</span>
              <span className="text-lg font-bold text-green-600">{donation.amount}€</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-[#9a8a7a] uppercase tracking-wider">STATUS</span>
              <span className="text-sm font-bold uppercase text-orange-600">{donation.status || donation.payment?.status}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-[#9a8a7a] uppercase tracking-wider">PROVIDER</span>
              <span className="text-sm font-bold text-[#3a2a1a] uppercase">{donation.method || donation.payment?.provider}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-[#9a8a7a] uppercase tracking-wider">DATE</span>
              <span className="text-sm text-[#3a2a1a]">{new Date(donation.createdAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Metadata/Company Info */}
          {donation.isCompanyDonation && donation.companyInfo && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[#9a8a7a] uppercase tracking-wider">COMPANY INFO</span>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-[12px] text-blue-800">
                <p><strong>Name:</strong> {donation.companyInfo.name}</p>
                <p><strong>VAT:</strong> {donation.companyInfo.vatNumber}</p>
                <p><strong>Address:</strong> {donation.companyInfo.address}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-[#9a8a7a] uppercase tracking-wider">TRANSACTION ID</span>
            <span className="text-[11px] font-mono bg-gray-100 p-1.5 rounded border border-gray-200 break-all">
              {donation.payment?.providerTransactionId}
            </span>
          </div>
        </div>

        <div className="px-6 py-4 bg-[#fcfaf7] border-t border-[#e8ddd0] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#3a2a1a] text-white text-xs font-bold px-6 py-2 rounded-lg hover:bg-[#2a1a0a] transition-colors"
          >
            {t.closeBtn || "CLOSE"}
          </button>
        </div>
      </div>
    </div>
  );
};

const DonationRow = React.memo(({ donation, t, onViewDetails, onReceipt }) => {
  const statusColors = {
    "Trait\u00E9": "bg-green-100 text-green-600",
    "Processed": "bg-green-100 text-green-600",
    "En attente": "bg-orange-100 text-orange-600",
    "Pending": "bg-orange-100 text-orange-600",
    "completed": "bg-green-100 text-green-600",
    "pending": "bg-orange-100 text-orange-600",
    "cancelled": "bg-gray-100 text-gray-600",
    "failed": "bg-red-100 text-red-600"
  };

  const methodIcons = {
    stripe: "💳",
    paypal: "🅿️",
    collection_point: "📦"
  };

  return (
    <tr className="border-b border-[#f0e8d8] last:border-0 hover:bg-[#fcfaf7] transition-colors text-xs">
      <td className="py-4 px-4 font-bold text-[#3a2a1a]">{donation.user}</td>
      <td className="py-4 px-4 font-bold text-[#3a2a1a]">{donation.amount}€</td>
      <td className="py-4 px-4 text-[#3a2a1a]">{donation.association}</td>
      <td className="py-4 px-4 text-[#3a2a1a] font-medium flex items-center gap-1.5 uppercase text-[10px]">
        <span>{methodIcons[donation.method] || "💰"}</span>
        {donation.method?.replace('_', ' ')}
      </td>
      <td className="py-4 px-4 text-[#9a8a7a]">{donation.date}</td>
      <td className="py-4 px-4">
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColors[donation.status]}`}>
          {donation.status}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => onViewDetails(donation.id)}
            className="w-20 bg-[#fcfaf7] text-[#3a2a1a] text-[10px] font-bold py-1 rounded border border-[#e8ddd0] hover:bg-[#f0e8d8] transition-colors"
          >
            {t.detailsBtn || "Details"}
          </button>
          {donation.status.toLowerCase().includes("pending") || donation.status.toLowerCase().includes("attente") ? (
            <button
              onClick={() => onReceipt(donation.id, false)}
              className="w-28 bg-blue-100 text-blue-600 text-[10px] font-bold py-1 rounded hover:bg-blue-200 transition-colors text-center"
            >
              {t.receiptBtn}
            </button>
          ) : (
            <button
              onClick={() => onReceipt(donation.id, true)}
              className="w-28 bg-blue-50 text-blue-600 text-[10px] font-bold py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors text-center"
            >
              {t.fiscalReceipt}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

export default function DonationsPage() {
  const { t, lang } = useLang();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queryParams, setQueryParams] = useState({ page: 1, limit: 10, search: "", status: "" });
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isFiscal, setIsFiscal] = useState(false);

  const fetchSingleDonation = async (id, type = 'details') => {
    try {
      const res = await api.get(`/donations/${id}`);
      if (res.data.status === "ok" || res.data.success) {
        setSelectedDonation(res.data.data);
        if (type === 'details') {
          setIsModalOpen(true);
        } else {
          setIsReceiptModalOpen(true);
          setIsFiscal(type === 'fiscal');
        }
      }
    } catch (err) {
      console.error("Failed to fetch donation details", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: queryParams.page,
          limit: queryParams.limit,
          search: queryParams.search,
          ...(queryParams.status && queryParams.status !== "all" ? { status: queryParams.status } : {})
        }).toString();

        const [donationsRes, statsRes] = await Promise.all([
          api.get(`/donations/get-all-donation?${query}`),
          api.get("/donations/stats"),
        ]);

        if (donationsRes.data.status === "ok" || donationsRes.data.success) {
          setDonations(donationsRes.data.data || []);
          setMeta(donationsRes.data.meta);
        }

        if (statsRes.data.status === "ok" || statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch donations", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [queryParams]);

  const statCards = [
    { label: t.totalCollected, value: { text: `${stats?.totalCollected || 0}€`, color: "text-green-600" } },
    { label: t.returnedAssos, value: { text: `${stats?.returnedToAssos || 0}€`, color: "text-blue-600" } },
    { label: t.pendingLabel, value: { text: `${stats?.pendingAmount || 0}€`, color: "text-orange-500" } },
    { label: t.averageBasket, value: { text: `${Math.round(stats?.averageBasket || 0)}€`, color: "text-[#3a2a1a]" } },
  ];

  return (
    <div className="px-6 py-4 flex flex-col gap-4">

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <StatCard key={i} loading={loading} {...s} />
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-[#e8ddd0] overflow-hidden shadow-sm">
        <FilterBar
          onSearch={(val) => setQueryParams(p => ({ ...p, search: val, page: 1 }))}
          onFilterChange={(name, val) => setQueryParams(p => ({ ...p, [name]: val, page: 1 }))}
          onSortChange={() => { }} // Not used yet
          related={true}
          filters={[
            {
              name: "status", label: "ALL", options: [
                { label: "COMPLETED", value: "completed" },
                { label: "PENDING", value: "pending" },
                { label: "CANCELLED", value: "cancelled" },
                { label: "REJECTED", value: "failed" }
              ]
            }
          ]}
          sortOptions={[]}
          actionButton={
            <button className="bg-[#3a2a1a] text-white text-[11px] font-bold px-4 py-2 rounded-xl hover:bg-[#2a1a0a] transition-colors flex items-center gap-2">
              <span>📤</span> {t.exportBtn}
            </button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#fcfaf7] border-b border-[#e8ddd0]">
                <th className="py-3 px-4 text-[10px] font-bold text-[#9a8a7a] tracking-widest">{t.donator}</th>
                <th className="py-3 px-4 text-[10px] font-bold text-[#9a8a7a] tracking-widest">{t.amount}</th>
                <th className="py-3 px-4 text-[10px] font-bold text-[#9a8a7a] tracking-widest">{t.association}</th>
                <th className="py-3 px-4 text-[10px] font-bold text-[#9a8a7a] tracking-widest">METHOD</th>
                <th className="py-3 px-4 text-[10px] font-bold text-[#9a8a7a] tracking-widest">{t.dateLabel || "DATE"}</th>
                <th className="py-3 px-4 text-[10px] font-bold text-[#9a8a7a] tracking-widest">{t.statusLabel || "STATUS"}</th>
                <th className="py-3 px-4 text-[10px] font-bold text-[#9a8a7a] tracking-widest text-right">{t.actionsLabel || "ACTIONS"}</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d, i) => (
                <DonationRow
                  key={d._id || i}
                  donation={{
                    id: d._id,
                    user: d.donorName || "Anonyme",
                    amount: d.amount,
                    association: d.association || "HESTEKA",
                    method: d.method,
                    date: new Date(d.createdAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US'),
                    status: d.status || d.payment?.status || "completed"
                  }}
                  t={t}
                  onViewDetails={(id) => fetchSingleDonation(id, 'details')}
                  onReceipt={(id, fiscal) => fetchSingleDonation(id, fiscal ? 'fiscal' : 'receipt')}
                />
              ))}
              {!loading && donations.length === 0 && (
                <tr><td colSpan={6} className="text-center py-20 text-[#9a8a7a] italic">{t.noDataFound}</td></tr>
              )}
              {loading && (
                <tr><td colSpan={6} className="text-center py-20 text-[#9a8a7a]">{t.loadingLabel}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          meta={meta}
          onPageChange={(page) => setQueryParams(p => ({ ...p, page }))}
        />
      </div>

      <DonationDetailModal
        donation={selectedDonation}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        t={t}
      />

      <ReceiptModal
        donation={selectedDonation}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        t={t}
        isFiscal={isFiscal}
      />
    </div>
  );
}


