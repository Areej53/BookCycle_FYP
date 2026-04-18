import { api } from "../api/client";

const authHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const DashboardApi = {
  getOrders: async ({ token, sellerId, buyerId }) => {
    const { data } = await api.get("/orders", {
      ...authHeaders(token),
      params: { sellerId, buyerId },
    });
    return data;
  },

  createOrder: async ({ token, payload }) => {
    const { data } = await api.post("/orders", payload, authHeaders(token));
    return data;
  },

  updateOrder: async ({ token, orderId, payload }) => {
    const { data } = await api.put(`/orders/${orderId}`, payload, authHeaders(token));
    return data;
  },

  getBooks: async ({ token, sellerId }) => {
    const { data } = await api.get("/books", {
      ...authHeaders(token),
      params: { sellerId },
    });
    return data;
  },

  createBook: async ({ token, payload }) => {
    const { data } = await api.post("/books", payload, authHeaders(token));
    return data;
  },

  updateBook: async ({ token, id, payload }) => {
    const { data } = await api.patch(`/books/${id}`, payload, authHeaders(token));
    return data;
  },

  deleteBook: async ({ token, id }) => {
    const { data } = await api.delete(`/books/${id}`, authHeaders(token));
    return data;
  },

  getUsers: async ({ token }) => {
    const { data } = await api.get("/users", authHeaders(token));
    return data;
  },

  getNotifications: async ({ token }) => {
    const { data } = await api.get("/notifications", authHeaders(token));
    return data;
  },

  createNotification: async ({ token, payload }) => {
    const { data } = await api.post("/notifications", payload, authHeaders(token));
    return data;
  },

  markNotificationRead: async ({ token, id }) => {
    const { data } = await api.patch(`/notifications/${id}/read`, {}, authHeaders(token));
    return data;
  },
};
