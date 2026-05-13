import api from "./axios";
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);
export const getMe = () => api.get("/auth/me");
export const forgotPassword = (data) => api.post("/auth/forgot-password", data);
export const verifyOTP      = (data) => api.post("/auth/verify-otp",      data);
export const resetPassword  = (data) => api.post("/auth/reset-password",  data);
export const updateProfile  = (data) => api.put("/auth/profile", data);
export const changePassword = (data) => api.put("/auth/change-password", data);