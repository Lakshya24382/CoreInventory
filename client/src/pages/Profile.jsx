import { useState } from "react";
import { updateProfile } from "../api/auth";
import { forgotPassword, verifyOTP, resetPassword } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import toast from "react-hot-toast";
import { User, Lock, Mail, Shield, ArrowRight } from "lucide-react";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [nameForm, setNameForm] = useState({ name: user?.name || "" });
  const [savingName, setSavingName] = useState(false);

  const [passStep, setPassStep]   = useState(1);
  const [otp, setOtp]             = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPass, setLoadingPass]         = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setSavingName(true);
    try {
      const res = await updateProfile(nameForm);
      updateUser({ name: res.data.name });
      toast.success("Name updated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update");
    } finally {
      setSavingName(false);
    }
  };

  // Step 1 — send OTP to their email
  const handleSendOTP = async () => {
    setLoadingPass(true);
    try {
      await forgotPassword({ email: user.email });
      toast.success(`OTP sent to ${user.email}`);
      setPassStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoadingPass(false);
    }
  };

  // Step 2 — verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoadingPass(true);
    try {
      await verifyOTP({ email: user.email, otp });
      toast.success("OTP verified!");
      setPassStep(3);
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoadingPass(false);
    }
  };

  // Step 3 — set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoadingPass(true);
    try {
      await resetPassword({ email: user.email, otp, newPassword });
      toast.success("Password changed successfully!");
      setPassStep(1);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoadingPass(false);
    }
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const stepLabels = ["Request OTP", "Verify OTP", "New password"];

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">Manage your account details</p>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* Avatar + info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <Mail size={13} />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Shield size={13} className="text-indigo-500" />
                <span className="text-xs font-medium text-indigo-600 capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Update name */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-gray-500" />
            <h2 className="text-base font-semibold text-gray-800">Personal information</h2>
          </div>
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input required value={nameForm.name}
                onChange={(e) => setNameForm({ name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input disabled value={user?.email}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <button type="submit" disabled={savingName}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
              {savingName ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        {/* Change password — OTP flow */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-gray-500" />
            <h2 className="text-base font-semibold text-gray-800">Change password</h2>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                  passStep > i + 1 ? "bg-green-500 text-white" :
                  passStep === i + 1 ? "bg-indigo-600 text-white" :
                  "bg-gray-200 text-gray-400"
                }`}>
                  {passStep > i + 1 ? "✓" : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${passStep === i + 1 ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                  {label}
                </span>
                {i < 2 && (
                  <div className={`flex-1 h-px ${passStep > i + 1 ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1 — send OTP */}
          {passStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                We'll send a one-time password to{" "}
                <span className="font-medium text-gray-700">{user?.email}</span>
              </p>
              <button onClick={handleSendOTP} disabled={loadingPass}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {loadingPass ? "Sending..." : "Send OTP"}
                {!loadingPass && <ArrowRight size={14} />}
              </button>
            </div>
          )}

          {/* Step 2 — enter OTP */}
          {passStep === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <p className="text-sm text-gray-500">
                Enter the 6-digit code sent to{" "}
                <span className="font-medium text-gray-700">{user?.email}</span>
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OTP code</label>
                <input
                  type="text" required maxLength={6} value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm text-center tracking-[0.5em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loadingPass || otp.length < 6}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {loadingPass ? "Verifying..." : "Verify OTP"}
                </button>
                <button type="button" onClick={() => { setPassStep(1); setOtp(""); }}
                  className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                  Resend
                </button>
              </div>
            </form>
          )}

          {/* Step 3 — new password */}
          {passStep === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                <input type="password" required value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <input type="password" required value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    confirmPassword && confirmPassword !== newPassword
                      ? "border-red-400" : "border-gray-300"
                  }`} />
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
              <button type="submit"
                disabled={loadingPass || newPassword !== confirmPassword}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                {loadingPass ? "Saving..." : "Set new password"}
              </button>
            </form>
          )}
        </div>

      </div>
    </Layout>
  );
}