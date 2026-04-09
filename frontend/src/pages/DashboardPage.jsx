import React from 'react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
    return (
        <div style={{ padding: '100px 5%', textAlign: 'center', minHeight: '60vh' }}>
            <h2>Seller Dashboard</h2>
            <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>This page is currently under construction.</p>
            <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '30px' }}>Go Back Home</Link>
        </div>
    );
}
