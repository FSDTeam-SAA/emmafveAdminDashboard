import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useLang } from '../../context/LanguageContext';

const ProfileModal = ({ isOpen, onClose, user, onUpdate, isReadOnly = false }) => {
  const { t } = useLang();
  const [formData, setFormData] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("adminUser")) || {};
  const effectiveIsReadOnly = isReadOnly || (user && currentUser._id && user._id !== currentUser._id);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
        company: user.company || '',
        selfIntroduction: user.selfIntroduction || '',
      });
      setPreviewImage(user.profileImage?.secure_url || null);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (effectiveIsReadOnly) return;
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (effectiveIsReadOnly) return;
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      const res = await api.patch("/user/update-user", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.status === "ok") {
        toast.success("Profile updated successfully");
        onUpdate();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const initials = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`.toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Cover / Header Section */}
        <div className="relative h-32 bg-gradient-to-r from-[#8B6914] to-[#5a4a3a]">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 bg-black/20 hover:bg-black/40 rounded-full p-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8">
          {/* Profile Picture (Instagram style overlapping) */}
          <div className="relative -mt-16 mb-6 flex flex-col items-center">
            <div className={`relative group ${effectiveIsReadOnly ? '' : 'cursor-pointer'}`} onClick={() => !effectiveIsReadOnly && fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-[#8B6914] font-bold text-4xl overflow-hidden shadow-lg">
                {previewImage ? (
                  <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  initials || "A"
                )}
              </div>
              
              {!effectiveIsReadOnly && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
            
            <div className="mt-3 text-center">
              <h2 className="text-2xl font-bold text-[#3a2a1a]">{user?.firstName} {user?.lastName}</h2>
              <p className="text-[#9a8a7a] text-sm uppercase tracking-wider font-semibold">{user?.role?.replace('_', ' ')}</p>
              <p className="text-[#9a8a7a] text-sm mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="block text-[#a09080] text-[10px] font-bold uppercase tracking-wider mb-1">{t.firstName}</label>
              <input 
                type="text" 
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleChange}
                className="w-full bg-[#fcfaf7] border border-[#f0e8d8] text-[#3a2a1a] rounded-lg px-4 py-2 focus:outline-none focus:border-[#8B6914] focus:ring-1 focus:ring-[#8B6914] disabled:opacity-75 disabled:bg-gray-100"
                required
                disabled={effectiveIsReadOnly}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[#a09080] text-[10px] font-bold uppercase tracking-wider mb-1">{t.lastName}</label>
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleChange}
                className="w-full bg-[#fcfaf7] border border-[#f0e8d8] text-[#3a2a1a] rounded-lg px-4 py-2 focus:outline-none focus:border-[#8B6914] focus:ring-1 focus:ring-[#8B6914] disabled:opacity-75 disabled:bg-gray-100"
                required
                disabled={effectiveIsReadOnly}
              />
            </div>
            
            <div className="col-span-1">
              <label className="block text-[#a09080] text-[10px] font-bold uppercase tracking-wider mb-1">{t.phone}</label>
              <input 
                type="text" 
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                className="w-full bg-[#fcfaf7] border border-[#f0e8d8] text-[#3a2a1a] rounded-lg px-4 py-2 focus:outline-none focus:border-[#8B6914] focus:ring-1 focus:ring-[#8B6914] disabled:opacity-75 disabled:bg-gray-100"
                disabled={effectiveIsReadOnly}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[#a09080] text-[10px] font-bold uppercase tracking-wider mb-1">{t.company}</label>
              <input 
                type="text" 
                name="company"
                value={formData.company || ''}
                onChange={handleChange}
                className="w-full bg-[#fcfaf7] border border-[#f0e8d8] text-[#3a2a1a] rounded-lg px-4 py-2 focus:outline-none focus:border-[#8B6914] focus:ring-1 focus:ring-[#8B6914] disabled:opacity-75 disabled:bg-gray-100"
                disabled={effectiveIsReadOnly}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-[#a09080] text-[10px] font-bold uppercase tracking-wider mb-1">{t.address}</label>
              <input 
                type="text" 
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full bg-[#fcfaf7] border border-[#f0e8d8] text-[#3a2a1a] rounded-lg px-4 py-2 focus:outline-none focus:border-[#8B6914] focus:ring-1 focus:ring-[#8B6914] disabled:opacity-75 disabled:bg-gray-100"
                disabled={effectiveIsReadOnly}
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-[#a09080] text-[10px] font-bold uppercase tracking-wider mb-1">{t.bioIntro}</label>
              <textarea 
                name="selfIntroduction"
                value={formData.selfIntroduction || ''}
                onChange={handleChange}
                rows="3"
                className="w-full bg-[#fcfaf7] border border-[#f0e8d8] text-[#3a2a1a] rounded-lg px-4 py-2 focus:outline-none focus:border-[#8B6914] focus:ring-1 focus:ring-[#8B6914] resize-none disabled:opacity-75 disabled:bg-gray-100"
                placeholder={effectiveIsReadOnly ? "" : t.bioPlaceholder}
                disabled={effectiveIsReadOnly}
              ></textarea>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            {effectiveIsReadOnly ? (
              <button 
                type="button" 
                onClick={onClose}
                className="px-8 py-2.5 bg-[#8B6914] text-white text-sm font-bold rounded-lg hover:bg-[#6a5010] shadow-lg hover:shadow-xl transition-all"
              >
                {t.close}
              </button>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm font-bold text-[#9a8a7a] hover:text-[#3a2a1a] transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-8 py-2.5 bg-[#8B6914] text-white text-sm font-bold rounded-lg hover:bg-[#6a5010] shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? t.saving : t.saveProfile}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
