import api from "./axios";
export const getProducts = () => api.get("/products");
export const getCategories = () => api.get("/products/categories");
export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getArchivedProducts = () => api.get("/products/archived");
export const restoreProduct      = (id) => api.put(`/products/${id}/restore`);
export const getProductStock = (productId, locationId) =>
  api.get(`/products/${productId}/stock/${locationId}`);