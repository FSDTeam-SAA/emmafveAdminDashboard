import React, { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { toast } from "react-toastify";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { t } = useLang();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast.error("Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    
    // Password validation based on schema: min 6, max 16, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,16}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Password must be 6-16 characters long, contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok && data.status === "ok") {
        toast.success(data.message || "Password reset successful.");
        setSuccess(true);
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      } else {
        toast.error(data.message || "Failed to reset password.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex items-center justify-center p-4 md:p-8">
      {/* Responsive Card */}
      <div className="w-full max-w-sm md:max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">

        {/* Hero / Logo Section */}
        <div className="relative h-52 md:h-auto md:min-h-[500px] md:w-1/2 overflow-hidden flex flex-col items-center justify-center">
          {/* Cat hero bg subtle pattern */}
          <div className="absolute inset-0 opacity-90">
            <img src="/images/cat_hero.jpg" alt="" className="w-full h-full object-cover object-center" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-br from-[#2a1a0a]/60 to-[#2a1a0a]/80" />
          {/* Actual HESTEKA logo */}
          <img
            src="/images/Logo.png"
            alt="HESTEKA"
            className="relative z-10 h-24 md:h-32 object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-300"
          />
        </div>

        {/* Form Section */}
        <div className="px-7 py-8 md:p-12 md:w-1/2 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-[#c0501a] text-center mb-6" style={{ fontFamily: "serif" }}>
            {success ? "Success" : "Reset Password"}
          </h2>

          {success ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-[#3a2a1a] font-medium text-center">Your password has been successfully reset.</p>
              <p className="text-sm text-[#9a8a7a] text-center">Redirecting you to login...</p>
              <button
                onClick={() => navigate("/login", { replace: true })}
                className="mt-6 w-full bg-[#c0501a] text-white font-bold py-3 rounded-full text-sm hover:bg-[#a04015] transition-all shadow-md active:scale-[0.98]"
              >
                Go to Login Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <p className="text-xs text-[#9a8a7a] text-center mb-2">
                Please enter your new password below.
              </p>
              
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#3a2a1a]">
                  New Password <span className="text-[#c0501a]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
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

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#3a2a1a]">
                  Confirm New Password <span className="text-[#c0501a]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-[#c0501a] text-white placeholder:text-white/70 rounded-full px-5 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-[#8B3010] transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full bg-[#c0501a] text-white font-bold py-3 rounded-full text-sm hover:bg-[#a04015] transition-all shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center relative"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Resetting...
                  </div>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4 absolute right-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-[10px] text-[#9a8a7a] mt-6">
            🔒 {t.adminOnly || "Admin access only"} · HESTEKA © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
