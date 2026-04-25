import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { toast } from "react-toastify";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error(t.fillAllFields || "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, rememberMe: form.rememberMe }),
        credentials: "include",
      });
      const data = await res.json();

      if (data.status === "ok") {
        const userData = data.data;
        if (userData.role !== "admin") {
          toast.error(t.accessDeniedAdmin || "Access denied. Admin accounts only.");
          setLoading(false);
          return;
        }
        localStorage.setItem("adminUser", JSON.stringify(userData));
        localStorage.setItem("adminAccessToken", userData.accessToken);
        localStorage.setItem("adminRefreshToken", userData.refreshToken);
        toast.success(`${t.welcomeBack || "Welcome back"}, ${userData.firstName}!`);
        navigate("/dashboard", { replace: true });
      } else {
        toast.error(data.message || t.loginFailed || "Login failed. Check your credentials.");
      }
    } catch (err) {
      toast.error(t.networkError || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4">
      {/* Phone-style card */}
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">

        {/* Hero / Logo Section */}
        <div className="relative h-52 overflow-hidden flex flex-col items-center justify-center gap-3">
          {/* Cat hero bg subtle pattern */}
          <div className="absolute inset-0 opacity-90">
            <img src="/images/cat_hero.jpg" alt="" className="w-full h-full object-cover object-center" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#2a1a0a]/60 to-[#2a1a0a]/80" />
          {/* Actual HESTEKA logo */}
          <img
            src="/images/Logo.png"
            alt="HESTEKA"
            className="relative z-10 h-25 object-contain drop-shadow-xl"
          />
        </div>

        {/* Form Section */}
        <div className="px-7 py-7">
          <h2 className="text-3xl font-bold text-[#c0501a] text-center mb-6" style={{ fontFamily: "serif" }}>
            {t.loginTitle}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#3a2a1a]">
                {t.emailLabel} <span className="text-[#c0501a]">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="admin-email"
                value={form.email}
                onChange={handleChange}
                placeholder={t.enterEmail}
                className="w-full bg-[#c0501a] text-white placeholder:text-white/70 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B3010] transition-all"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#3a2a1a]">
                {t.passwordLabel} <span className="text-[#c0501a]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="admin-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={t.enterPassword}
                  className="w-full bg-[#c0501a] text-white placeholder:text-white/70 rounded-full px-5 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-[#8B3010] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-left -mt-1">
              <button
                type="button"
                className="text-[11px] text-[#c0501a] hover:underline font-medium"
              >
                {t.forgotPassword}
              </button>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember-me"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 accent-[#c0501a] cursor-pointer"
              />
              <label htmlFor="remember-me" className="text-[11px] text-[#9a8a7a] cursor-pointer select-none">
                {t.rememberMe}
              </label>
            </div>

            {/* Continue button */}
            <button
              type="submit"
              id="admin-login-btn"
              disabled={loading}
              className="mt-2 w-full bg-white border-2 border-[#c0501a] text-[#c0501a] font-bold py-3 rounded-full text-sm hover:bg-[#c0501a] hover:text-white transition-all shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#c0501a]/30 border-t-[#c0501a] rounded-full animate-spin" />
                  {t.signingIn}
                </>
              ) : (
                t.signInBtn
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[10px] text-[#9a8a7a] mt-6">
            🔒 {t.adminOnly} · HESTEKA © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
