import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiSearch } from 'react-icons/fi';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'var(--bg)',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '8rem',
        fontWeight: '900',
        color: 'var(--primary)',
        marginBottom: '20px',
        lineHeight: 1
      }}>
        404
      </div>
      
      <h1 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '2rem',
        color: 'var(--primary)',
        marginBottom: '16px'
      }}>
        Page Not Found
      </h1>
      
      <p style={{
        fontSize: '1.1rem',
        color: 'var(--text-muted)',
        marginBottom: '32px',
        maxWidth: '480px',
        lineHeight: 1.6
      }}>
        The page you're looking for doesn't exist or has been moved.
        Let's get you back on track.
      </p>
      
      <div style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--cta)',
            color: '#fff',
            padding: '14px 28px',
            borderRadius: '50px',
            fontSize: '1rem',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 18px rgba(188,108,37,0.4)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(188,108,37,0.45)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 18px rgba(188,108,37,0.4)';
          }}
        >
          <FiHome size={18} />
          Go Home
        </button>
        
        <button
          onClick={() => navigate('/explore')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            color: 'var(--primary)',
            padding: '14px 28px',
            borderRadius: '50px',
            fontSize: '1rem',
            fontWeight: '600',
            border: '1.5px solid var(--border)',
            cursor: 'pointer',
            transition: 'border-color 0.2s, color 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--primary)';
          }}
        >
          <FiSearch size={18} />
          Explore Books
        </button>
      </div>
      
      <div style={{
        marginTop: '48px',
        padding: '20px',
        background: 'rgba(19,73,60,0.05)',
        borderRadius: '12px',
        maxWidth: '400px'
      }}>
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          marginBottom: '12px',
          fontWeight: '600'
        }}>
          Quick Links:
        </p>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          textAlign: 'left'
        }}>
          <Link 
            to="/home" 
            style={{
              color: 'var(--primary)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--primary)'}
          >
            → Home Page
          </Link>
          <Link 
            to="/explore" 
            style={{
              color: 'var(--primary)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--primary)'}
          >
            → Browse Books
          </Link>
          <Link 
            to="/wishlist" 
            style={{
              color: 'var(--primary)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--primary)'}
          >
            → My Wishlist
          </Link>
          <Link 
            to="/cart" 
            style={{
              color: 'var(--primary)',
              textDecoration: 'none',
              fontSize: '0.95rem',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--primary)'}
          >
            → My Cart
          </Link>
        </div>
      </div>
    </div>
  );
}