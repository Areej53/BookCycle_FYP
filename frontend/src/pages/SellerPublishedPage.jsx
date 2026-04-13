import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../data/assets';
import { useAuth } from '../context/AuthContext';
import { FiCheckCircle, FiLayout, FiPlusCircle, FiArrowUpRight } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function SellerPublishedPage() {
    const { user } = useAuth();

    return (
        <div className="SellerPublishedPage">
            
<header className="seller-header">
<Navbar />
</header>

<div className="page-layout published-layout">
<main className="published-main">
  <div className="pub-card">
    <div className="pub-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: 'var(--accent)' }}>
      <FiCheckCircle size={64} />
    </div>
    <h1 className="pub-title">Your Book is <em>Live!</em></h1>
    <p className="pub-sub">Congratulations! Your listing has been successfully placed on BookCycle. It is now visible to thousands of readers across Islamabad.</p>
    
    <div className="pub-ctas">
      <Link to="/home" className="btn-pub-dash"><FiLayout /> View Dashboard</Link>
      <Link to="/seller" className="btn-pub-add"><FiPlusCircle /> Add Another Book</Link>
    </div>

    <div className="pub-links">
      <Link to="/browse">View Listing Page <FiArrowUpRight /></Link>
      <div className="pub-dot"></div>
      <Link to="/seller">Manage Listings <FiArrowUpRight /></Link>
    </div>
  </div>
</main>
</div>

<Footer />
        </div>
    );
}