import React, { createContext, useCallback, useContext, useMemo, useState, useRef, useEffect } from "react";
import { DashboardApi } from "../services/api";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const previousNotificationsRef = useRef([]);
  const isInitialLoad = useRef(true);

  const fetchNotifications = useCallback(async () => {
    if (!token) return [];
    setLoading(true);
    try {
      const data = await DashboardApi.getNotifications({ token });
      const now = new Date().getTime();
      let list = data.notifications || [];
      
      // Auto Remove Notifications After 24 Hours
      list = list.filter(n => now - new Date(n.createdAt).getTime() < 24 * 60 * 60 * 1000);
      
      // Sort: unread first, then recent
      list.sort((a, b) => {
        if (a.isRead === b.isRead) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return a.isRead ? 1 : -1;
      });

      if (!isInitialLoad.current) {
        const prevIds = new Set(previousNotificationsRef.current.map(n => n._id));
        const newUnread = list.filter(n => !n.isRead && !prevIds.has(n._id));
      }

      previousNotificationsRef.current = list;
      isInitialLoad.current = false;

      setNotifications(list);
      return list;
    } catch {
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    isInitialLoad.current = true;
    if (token) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [token, fetchNotifications]);

  const markAsRead = useCallback(
    async (id) => {
      if (!token) return;
      await DashboardApi.markNotificationRead({ token, id });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    },
    [token]
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) return;
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
    if (unreadIds.length === 0) return;
    
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    
    // Fire and forget requests
    Promise.all(unreadIds.map(id => DashboardApi.markNotificationRead({ token, id })))
      .catch(console.error);
  }, [token, notifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
