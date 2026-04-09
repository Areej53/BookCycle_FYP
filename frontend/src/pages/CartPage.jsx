import React from 'react';
import { Link } from 'react-router-dom';

export default function CartPage() {
    return (
        <div style={{ padding: '100px 5%', textAlign: 'center', minHeight: '60vh' }}>
            <h2>Your Cart</h2>
            <p style={{ marginTop: '20px', color: 'var(--text-muted)' }}>Your cart is currently empty or under construction.</p>
            <Link to="/browse" className="btn-primary" style={{ display: 'inline-block', marginTop: '30px' }}>Browse Books</Link>
        </div>
    );
}
