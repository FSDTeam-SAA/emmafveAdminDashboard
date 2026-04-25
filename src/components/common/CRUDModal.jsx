import React, { useState, useEffect } from 'react';

const CRUDModal = ({ title, fields, initialData, isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (initialData) {
      const initial = {};
      fields.forEach(f => {
        if (initialData[f.name] !== undefined) {
          initial[f.name] = initialData[f.name];
        }
      });
      setFormData(initial);
    } else {
      setFormData({});
    }
  }, [initialData, isOpen, fields]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-[#f0e8d8] flex justify-between items-center bg-[#fcfaf7]">
          <h2 className="text-xl font-bold text-[#3a2a1a]">{title}</h2>
          <button 
            onClick={onClose}
            className="text-[#9a8a7a] hover:text-[#3a2a1a] transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="max-h-[60vh] overflow-y-auto pr-2 flex flex-col gap-4 custom-scrollbar">
            {fields.map((field) => (
              <div key={field.name} className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#9a8a7a] tracking-wider uppercase">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                    disabled={field.disabled}
                    className="bg-[#fcfaf7] border border-[#e8ddd0] rounded-lg px-4 py-2.5 text-sm text-[#3a2a1a] outline-none focus:border-[#8B6914] focus:ring-2 focus:ring-[#8B6914]/10 transition-all disabled:opacity-50 disabled:bg-gray-100"
                  >
                    <option value="">Select {field.label}</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                    disabled={field.disabled}
                    rows="3"
                    className="bg-[#fcfaf7] border border-[#e8ddd0] rounded-lg px-4 py-2.5 text-sm text-[#3a2a1a] outline-none focus:border-[#8B6914] focus:ring-2 focus:ring-[#8B6914]/10 transition-all resize-none disabled:opacity-50 disabled:bg-gray-100"
                  />
                ) : field.type === 'file' ? (
                  <input
                    type="file"
                    name={field.name}
                    onChange={handleChange}
                    required={field.required && !initialData}
                    disabled={field.disabled}
                    accept="image/*"
                    className="text-xs text-[#9a8a7a] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f5f0e8] file:text-[#3a2a1a] hover:file:bg-[#e8ddd0] transition-all disabled:opacity-50"
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                    disabled={field.disabled}
                    className="bg-[#fcfaf7] border border-[#e8ddd0] rounded-lg px-4 py-2.5 text-sm text-[#3a2a1a] outline-none focus:border-[#8B6914] focus:ring-2 focus:ring-[#8B6914]/10 transition-all disabled:opacity-50 disabled:bg-gray-100"
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-4 pt-4 border-t border-[#f0e8d8]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-[#e8ddd0] text-[#3a2a1a] text-sm font-bold hover:bg-[#fcfaf7] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#8B6914] text-white text-sm font-bold hover:bg-[#6a5010] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CRUDModal;
