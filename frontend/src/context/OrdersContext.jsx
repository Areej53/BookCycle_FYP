import React, { createContext, useCallback, useContext, useState } from "react";
import { DashboardApi } from "../services/api";
import { useAuth } from "./AuthContext";

const OrdersContext = createContext(null);

export const OrdersProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(
    async (filters = {}) => {
      if (!token) return [];
      setLoading(true);
      try {
        const sellerId = filters.sellerId || user?.id;
        const data = await DashboardApi.getOrders({ token, sellerId, buyerId: filters.buyerId });
        const list = data.orders || [];
        setOrders(list);
        return list;
      } finally {
        setLoading(false);
      }
    },
    [token, user]
  );

  return (
    <OrdersContext.Provider value={{ orders, loading, fetchOrders }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => useContext(OrdersContext);
