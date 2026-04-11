import React, { createContext, useState, useEffect } from 'react';

export const SellerContext = createContext();

export const SellerProvider = ({ children }) => {
  // Try to load from localStorage so refresh doesn't wipe progress
  const [sellerData, setSellerData] = useState(() => {
    const saved = localStorage.getItem('sellerData');
    return saved ? JSON.parse(saved) : {
      category: '',
      title: '',
      author: '',
      subject: '',
      edition: '',
      language: 'en',
      exchangeType: 'Sell',
      condition: 'Like New',
      duration: '1m',
      price: '',
      negotiable: 'no',
      rentWeek: '',
      rentMonth: '',
      securityDeposit: '',
      overdueFee: '',
      description: '',
      images: []
    };
  });

  useEffect(() => {
    localStorage.setItem('sellerData', JSON.stringify(sellerData));
  }, [sellerData]);

  const updateSellerData = (data) => {
    setSellerData((prev) => ({ ...prev, ...data }));
  };

  const resetSellerData = () => {
    const emptyState = {
      category: '',
      title: '',
      author: '',
      subject: '',
      edition: '',
      language: 'en',
      exchangeType: 'Sell',
      condition: 'Like New',
      duration: '1m',
      price: '',
      negotiable: 'no',
      rentWeek: '',
      rentMonth: '',
      securityDeposit: '',
      overdueFee: '',
      description: '',
      images: []
    };
    setSellerData(emptyState);
    localStorage.removeItem('sellerData');
  };

  return (
    <SellerContext.Provider value={{ sellerData, updateSellerData, resetSellerData }}>
      {children}
    </SellerContext.Provider>
  );
};
