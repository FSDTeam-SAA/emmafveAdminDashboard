import React, { useState, useEffect, useCallback } from "react";
import { useLang } from "../context/LanguageContext";
import { HelpCircle, Plus, Edit2, Trash2, GripVertical } from "lucide-react";
import api from "../utils/api";
import ConfirmModal from "../components/common/ConfirmModal";
import DataTable from "../components/common/DataTable";
import Pagination from "../components/common/Pagination";
import FilterBar from "../components/common/FilterBar";
import { toast } from "react-toastify";

export default function FAQPage() {
  const { t, lang } = useLang();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 10,
    language: lang || "fr",
    category: "ALL",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFaq, setCurrentFaq] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "GENERAL",
    language: queryParams.language,
    order: 0
  });

  const categories = [
    "GENERAL",
    "REPORT",
    "LOCAL MISSIONS",
    "MY ACCOUNT",
    "MESSAGING",
    "DONATIONS AND HELP",
    "SECURITY"
  ];

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams(queryParams).toString();
      const res = await api.get(`/faq?${queryString}`);
      if (res.data.status === "ok") {
        setFaqs(res.data.data.data);
        setMeta({
          total: res.data.data.total,
          page: res.data.data.page,
          limit: res.data.data.limit,
          totalPages: Math.ceil(res.data.data.total / res.data.data.limit)
        });
      }
    } catch (err) {
      console.error("Failed to fetch FAQs", err);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // Sync formData language with queryParams language when adding new
  useEffect(() => {
     if (!currentFaq) {
       setFormData(prev => ({ ...prev, language: queryParams.language }));
     }
  }, [queryParams.language, currentFaq]);

  const handleOpenModal = (faq = null) => {
    if (faq) {
      setCurrentFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        language: faq.language,
        order: faq.order
      });
    } else {
      setCurrentFaq(null);
      setFormData({
        question: "",
        answer: "",
        category: "GENERAL",
        language: queryParams.language,
        order: faqs.length
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentFaq) {
        await api.patch(`/faq/${currentFaq._id}`, formData);
        toast.success("FAQ updated successfully");
      } else {
        await api.post("/faq", formData);
        toast.success("New FAQ added successfully");
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err) {
      console.error("Failed to save FAQ", err);
      toast.error("Failed to save FAQ");
    }
  };

  const handleDelete = async () => {
    if (!faqToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/faq/${faqToDelete._id}`);
      toast.success("FAQ deleted successfully");
      setFaqToDelete(null);
      fetchFaqs();
    } catch (err) {
      console.error("Failed to delete FAQ", err);
      toast.error("Failed to delete FAQ");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { 
      header: t.categoryLabel || "CATEGORY", 
      cell: (r) => (
        <span className="px-2 py-1 rounded-full bg-[#f5f0e8] text-[#8B6914] text-[10px] font-bold uppercase">
          {r.category}
        </span>
      ) 
    },
    { 
      header: t.questionLabel || "QUESTION", 
      cell: (r) => <div className="max-w-[300px] font-bold text-xs text-[#3a2a1a]">{r.question}</div> 
    },
    { 
      header: t.answerLabel || "ANSWER", 
      cell: (r) => <div className="max-w-[400px] text-[10px] text-[#9a8a7a] line-clamp-2">{r.answer}</div> 
    },
    { 
      header: t.actionsLabel || "ACTIONS", 
      align: "right",
      cell: (r) => (
        <div className="flex items-center gap-2 justify-end">
          <button onClick={() => handleOpenModal(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setFaqToDelete(r)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) 
    },
  ];

  return (
    <div className="px-4 md:px-6 py-4 flex flex-col gap-4">
      <div className="bg-white rounded-xl border border-[#e8ddd0] overflow-hidden flex flex-col shadow-sm">
        <FilterBar 
          onSearch={(val) => setQueryParams(p => ({ ...p, search: val, page: 1 }))}
          onFilterChange={(name, val) => setQueryParams(p => ({ ...p, [name]: val, page: 1 }))}
          onSortChange={(sortBy, sort) => setQueryParams(p => ({ ...p, sortBy, sortOrder: sort === 'descending' ? 'desc' : 'asc', page: 1 }))}
          related={true}
          filters={[
            { 
              name: "category", 
              label: t.allCategories || "All categories", 
              options: categories.map(c => ({ label: c, value: c }))
            },
            {
              name: "language",
              label: "Language",
              options: [
                { label: "Français", value: "fr" },
                { label: "English", value: "en" }
              ]
            }
          ]}
          sortOptions={[
            { label: t.dateDesc || "Date (Newest)", value: "createdAt:descending" },
            { label: t.dateAsc || "Date (Oldest)", value: "createdAt:ascending" },
            { label: t.nameAsc || "Question (A-Z)", value: "question:ascending" },
            { label: t.orderLabel || "Order", value: "order:ascending" }
          ]}
          actionButton={
            <button 
              onClick={() => handleOpenModal()}
              className="bg-[#8B6914] text-white text-[11px] font-bold p-2.5 rounded-xl hover:bg-[#6a5010] transition-all flex items-center justify-center shadow-md active:scale-95"
              title={t.addFaq}
            >
              <Plus className="w-4 h-4" />
            </button>
          }
        />

        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={faqs}
            loading={loading}
            emptyMessage={t.noFaqsFound}
          />
        </div>

        <div className="bg-[#fcfaf7] border-t border-[#e8ddd0]">
          <Pagination 
            meta={meta} 
            onPageChange={(p) => setQueryParams(prev => ({ ...prev, page: p }))} 
          />
        </div>
      </div>

      {/* FAQ Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#f5f0e8] px-6 py-4 border-b border-[#e8ddd0] flex justify-between items-center">
              <h3 className="font-bold text-[#3a2a1a] text-sm uppercase tracking-wider">{currentFaq ? t.editFaq || "Edit FAQ" : t.addFaq || "Add FAQ"}</h3>
              <div className="flex gap-1.5">
                 <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${formData.language === 'fr' ? 'bg-[#8B6914] text-white' : 'bg-gray-100 text-gray-400'}`}>FR</div>
                 <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${formData.language === 'en' ? 'bg-[#8B6914] text-white' : 'bg-gray-100 text-gray-400'}`}>EN</div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#9a8a7a] uppercase tracking-wide">{t.categoryLabel || "Category"}</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="bg-[#fcfaf7] border border-[#e8ddd0] rounded-xl px-3 py-2 text-xs text-[#3a2a1a] outline-none focus:border-[#8B6914]"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#9a8a7a] uppercase tracking-wide">Language</label>
                  <select 
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className="bg-[#fcfaf7] border border-[#e8ddd0] rounded-xl px-3 py-2 text-xs text-[#3a2a1a] outline-none focus:border-[#8B6914]"
                  >
                    <option value="fr">French (Français)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#9a8a7a] uppercase tracking-wide">{t.questionLabel || "Question"}</label>
                <input 
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({...formData, question: e.target.value})}
                  placeholder="Enter the question..."
                  className="bg-[#fcfaf7] border border-[#e8ddd0] rounded-xl px-4 py-2.5 text-xs text-[#3a2a1a] outline-none focus:border-[#8B6914]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#9a8a7a] uppercase tracking-wide">{t.answerLabel || "Answer"}</label>
                <textarea 
                  required
                  value={formData.answer}
                  onChange={(e) => setFormData({...formData, answer: e.target.value})}
                  placeholder="Enter the answer..."
                  className="bg-[#fcfaf7] border border-[#e8ddd0] rounded-xl px-4 py-2.5 text-xs text-[#3a2a1a] outline-none focus:border-[#8B6914] h-32 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#9a8a7a] hover:bg-gray-50 transition-colors"
                >
                  {t.cancel || "Cancel"}
                </button>
                <button 
                  type="submit"
                  className="bg-[#8B6914] text-white text-xs font-bold px-8 py-2.5 rounded-xl hover:bg-[#6a5010] transition-all shadow-md active:scale-95"
                >
                  {t.saveChanges || "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!faqToDelete}
        onClose={() => setFaqToDelete(null)}
        onConfirm={handleDelete}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
        loading={isDeleting}
      />
    </div>
  );
}

