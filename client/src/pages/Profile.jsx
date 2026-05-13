import { useState } from "react";
import { updateProfile, changePassword } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import toast from "react-hot-toast";
import { User, Lock, Mail, Shield } from "lucide-react";

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [nameForm, setNameForm]   = useState({ name: user?.name || "" });
  const [passForm, setPassForm]   = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingName, setSavingName] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSavingPass(true);
    try {
      await changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to change password");
    } finally {
      setSavingPass(false);
    }
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">Manage your account details</p>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* Avatar + info card */}
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
              <input
                required
                value={nameForm.name}
                onChange={(e) => setNameForm({ name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                disabled
                value={user?.email}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <button
              type="submit"
              disabled={savingName}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
              {savingName ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-gray-500" />
            <h2 className="text-base font-semibold text-gray-800">Change password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
              <input
                type="password"
                required
                value={passForm.currentPassword}
                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
              <input
                type="password"
                required
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
              <input
                type="password"
                required
                value={passForm.confirmPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  passForm.confirmPassword && passForm.confirmPassword !== passForm.newPassword
                    ? "border-red-400"
                    : "border-gray-300"
                }`}
              />
              {passForm.confirmPassword && passForm.confirmPassword !== passForm.newPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
            <button
              type="submit"
              disabled={savingPass}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
              {savingPass ? "Changing..." : "Change password"}
            </button>
          </form>
        </div>

      </div>
    </Layout>
  );
}