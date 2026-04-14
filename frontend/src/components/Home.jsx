import { useState, useCallback, useEffect } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { IMAGES } from "../data/assets";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --primary: #13493C;
    --secondary: #606C38;
    --bg: #ffffff;
    --accent: #DDA15E;
    --cta: #BC6C25;
    --text: #13493C;
    --muted: #606C38;
    --border: #e8e0c4;
    --card: #fff;
  }

  @keyframes fadeUp { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
  @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

  /* Navbar */
  .h-navbar { background:var(--primary); display:flex; align-items:center; justify-content:space-between; padding:0 5%; height:76px; box-shadow:0 2px 20px rgba(19,73,60,.35); position:sticky; top:0; z-index:100; border-bottom:1.5px solid rgba(221,161,94,.45); }
  .h-logo { display:flex; align-items:center; gap:8px; cursor:pointer; text-decoration:none; }
  .h-logo-icon { width:52px; height:52px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .h-logo-icon img { width:100%; height:100%; object-fit:contain; display:block; }
  .h-logo-text { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:700; color:var(--bg); }
  .h-nav-links { display:flex; align-items:center; gap:6px; }
  .h-nav-link { color:rgba(255,250,224,.8); font-size:.88rem; font-weight:500; padding:7px 14px; border-radius:8px; transition:all .15s; background:none; border:none; font-family:'DM Sans',sans-serif; cursor:pointer; }
  .h-nav-link:hover { color:var(--bg); background:rgba(255,250,224,.1); }
  .h-nav-search { display:flex; align-items:center; gap:9px; background:rgba(255,250,224,.1); border:1px solid rgba(255,250,224,.2); border-radius:50px; padding:7px 16px; }
  .h-nav-search input { background:transparent; border:none; outline:none; color:var(--bg); font-size:.87rem; width:160px; font-family:'DM Sans',sans-serif; }
  .h-nav-search input::placeholder { color:rgba(255,250,224,.5); }
  .h-nav-links { display: flex; align-items: center; gap: 30px; margin: 0; padding: 0; list-style: none; }
  .h-nav-links a { color: rgba(255,250,224,0.85); text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.15s; }
  .h-nav-links a:hover { color: #fff; }
  .h-nav-cta { background: var(--accent); color: var(--primary) !important; padding: 8px 20px; border-radius: 50px; font-weight: 700; transition: all 0.2s; }
  .h-nav-cta:hover { background: var(--cta); color: #fff !important; transform: translateY(-1px); }
  .h-btn-ghost { background:transparent; border:1.5px solid rgba(255,250,224,.35); color:var(--bg); padding:8px 18px; border-radius:8px; font-weight:600; font-size:.87rem; cursor:pointer; transition:all .15s; font-family:'DM Sans',sans-serif; }
  .h-btn-ghost:hover { background:rgba(255,250,224,.1); border-color:rgba(255,250,224,.6); }
  .h-btn-solid { background:var(--accent); color:var(--primary); padding:8px 20px; border-radius:8px; font-weight:700; font-size:.87rem; border:none; cursor:pointer; transition:all .15s; font-family:'DM Sans',sans-serif; }
  .h-btn-solid:hover { background:var(--cta); color:#fff; }

  /* Hero */
  .h-hero { background:linear-gradient(135deg,var(--primary) 0%,#1a5e4a 60%,#0f3d2d 100%); padding:40px 5% 90px; position:relative; overflow:hidden; }
  .h-hero::before { content:''; position:absolute; inset:0; background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); opacity:.4; }
  .h-hero-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; position:relative; z-index:1; }
  .h-hero-label { display:inline-flex; align-items:center; gap:7px; background:rgba(221,161,94,.18); color:var(--accent); font-size:.73rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; padding:5px 14px; border-radius:50px; margin-bottom:18px; border:1px solid rgba(221,161,94,.3); }
  .h-hero-title { font-family:'Playfair Display',serif; font-size:clamp(2rem,3.5vw,3rem); font-weight:900; color:#fff; line-height:1.18; margin-bottom:16px; }
  .h-hero-title em { font-style:normal; color:var(--accent); }
  .h-hero-sub { font-size:1rem; color:rgba(255,255,255,.72); line-height:1.7; margin-bottom:32px; max-width:480px; }
  .h-hero-btns { display:flex; gap:12px; flex-wrap:wrap; }
  .h-btn-primary { background:var(--accent); color:var(--primary); padding:14px 32px; border-radius:50px; font-weight:700; font-size:.97rem; border:none; cursor:pointer; transition:all .18s; box-shadow:0 6px 22px rgba(221,161,94,.35); font-family:'DM Sans',sans-serif; }
  .h-btn-primary:hover { background:var(--cta); color:#fff; transform:translateY(-2px); box-shadow:0 10px 28px rgba(188,108,37,.4); }
  .h-btn-outline { background:transparent; color:#fff; padding:14px 32px; border-radius:50px; font-weight:600; font-size:.97rem; border:2px solid rgba(255,255,255,.35); cursor:pointer; transition:all .18s; font-family:'DM Sans',sans-serif; }
  .h-btn-outline:hover { background:rgba(255,255,255,.1); border-color:rgba(255,255,255,.7); }
  .h-hero-stats { display:flex; gap:28px; margin-top:36px; }
  .h-stat-num { font-family:'Playfair Display',serif; font-size:1.6rem; font-weight:900; color:var(--accent); }
  .h-stat-label { font-size:.74rem; color:rgba(255,255,255,.55); margin-top:2px; }
  .h-hero-visual { display:flex; align-items:center; justify-content:center; animation:floatY 4s ease-in-out infinite; }
  .h-books-stack { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .h-book-thumb { border-radius:12px; overflow:hidden; box-shadow:0 10px 32px rgba(0,0,0,.3); }
  .h-book-thumb img { width:100%; height:160px; object-fit:cover; display:block; }
  .h-book-thumb:nth-child(2) { margin-top:24px; }
  .h-book-thumb:nth-child(3) { margin-top:-24px; }

  /* Sections */
  .h-section { padding:72px 5%; font-family:'DM Sans',sans-serif; }
  .h-section.alt { background:rgba(19,73,60,.03); }
  .h-section.dark { background:var(--primary); }
  .h-section-inner { max-width:1200px; margin:0 auto; }
  .h-section-tag { font-size:.72rem; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:var(--cta); margin-bottom:10px; }
  .h-section-title { font-family:'Playfair Display',serif; font-size:clamp(1.6rem,2.5vw,2.2rem); font-weight:900; color:var(--primary); margin-bottom:8px; }
  .h-section-title em { font-style:normal; color:var(--cta); }
  .h-section-title.light { color:#fff; }
  .h-section-title.light em { color:var(--accent); }
  .h-section-sub { font-size:.93rem; color:var(--muted); margin-bottom:40px; line-height:1.65; }
  .h-section-sub.light { color:rgba(255,250,224,.7); }
  .h-section-head { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:32px; gap:16px; }
  .h-see-all { font-size:.84rem; font-weight:600; color:var(--cta); cursor:pointer; background:none; border:none; font-family:'DM Sans',sans-serif; }
  .h-see-all:hover { text-decoration:underline; }

  /* Book Cards */
  .h-books-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:18px; }
  .h-bcard { background:var(--card); border:1.5px solid var(--border); border-radius:16px; overflow:hidden; cursor:pointer; transition:all .2s; box-shadow:0 2px 12px rgba(19,73,60,.05); }
  .h-bcard:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(19,73,60,.13); border-color:var(--accent); }
  .h-bcard-img { position:relative; height:190px; overflow:hidden; }
  .h-bcard-img img { width:100%; height:100%; object-fit:cover; transition:transform .3s; }
  .h-bcard:hover .h-bcard-img img { transform:scale(1.05); }
  .h-badge { position:absolute; top:10px; left:10px; font-size:.65rem; font-weight:800; letter-spacing:.06em; text-transform:uppercase; padding:4px 10px; border-radius:50px; color:#fff; }
  .h-badge-buy { background:var(--cta); }
  .h-badge-rent { background:var(--primary); }
  .h-badge-free { background:var(--secondary); }
  .h-bcard-body { padding:13px 15px; display:flex; flex-direction:column; gap:4px; }
  .h-bcat { font-size:.68rem; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:var(--secondary); background:rgba(96,108,56,.1); padding:2px 8px; border-radius:50px; display:inline-block; width:fit-content; }
  .h-btitle { font-family:'Playfair Display',serif; font-size:.94rem; font-weight:700; color:var(--primary); line-height:1.25; margin-top:2px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
  .h-bauthor { font-size:.76rem; color:var(--muted); }
  .h-bprice { font-family:'Playfair Display',serif; font-size:1.05rem; font-weight:900; color:var(--cta); margin:4px 0; }
  .h-bprice.free { font-size:.82rem; font-weight:700; color:var(--secondary); background:rgba(96,108,56,.1); padding:3px 9px; border-radius:50px; display:inline-block; }
  .h-bstars { color:var(--accent); font-size:.78rem; letter-spacing:1px; margin-bottom:3px; }
  .h-bactions { display:flex; gap:6px; margin-top:6px; }
  .h-btn-details { flex:1; background:transparent; border:1.5px solid var(--border); color:var(--primary); padding:7px 0; border-radius:8px; font-size:.74rem; font-weight:600; text-align:center; transition:all .15s; cursor:pointer; font-family:'DM Sans',sans-serif; }
  .h-btn-details:hover { border-color:var(--primary); background:rgba(19,73,60,.04); }
  .h-btn-cart { flex:1; background:var(--cta); color:#fff; border:none; padding:7px 0; border-radius:8px; font-size:.74rem; font-weight:700; text-align:center; transition:background .15s; cursor:pointer; font-family:'DM Sans',sans-serif; }
  .h-btn-cart:hover { background:var(--primary); }

  /* How it works */
  .h-how-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; }
  .h-how-card { text-align:center; padding:28px 20px; background:var(--card); border:1.5px solid var(--border); border-radius:20px; transition:all .2s; }
  .h-how-card:hover { transform:translateY(-4px); box-shadow:0 10px 28px rgba(19,73,60,.1); border-color:var(--accent); }
  .h-how-circle { width:52px; height:52px; border-radius:50%; background:var(--primary); color:var(--bg); display:grid; place-items:center; margin:0 auto 20px; box-shadow:0 4px 12px rgba(19,73,60,.2); transition:transform .3s; }
  .h-how-card:hover .h-how-circle { transform:scale(1.1); }
  .h-how-circle svg { width:22px; height:22px; }
  .h-how-title { font-family:'Playfair Display',serif; font-size:.97rem; font-weight:700; color:var(--primary); margin-bottom:6px; }
  .h-how-desc { font-size:.81rem; color:var(--muted); line-height:1.6; }

  /* Categories */
  .h-cats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:14px; }
  .h-cat-pill { background:var(--card); border:1.5px solid var(--border); border-radius:50px; padding:12px 18px; display:flex; align-items:center; gap:10px; cursor:pointer; transition:all .18s; }
  .h-cat-pill:hover { background:var(--primary); border-color:var(--primary); box-shadow:0 4px 16px rgba(19,73,60,.2); }
  .h-cat-pill:hover .h-cat-name { color:var(--bg); }
  .h-cat-pill:hover .h-cat-count { color:rgba(255,250,224,.6); }
  .h-cat-icon { font-size:1.2rem; flex-shrink:0; }
  .h-cat-name { font-size:.85rem; font-weight:700; color:var(--primary); }
  .h-cat-count { font-size:.72rem; color:var(--muted); }

  /* Free shelf highlight */
  .h-free-box { background:linear-gradient(135deg,#1a5e4a,var(--primary)); border-radius:24px; padding:48px 40px; display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center; overflow:hidden; position:relative; }
  .h-free-box-icon { position:absolute; right:30px; top:20px; color:rgba(255,255,255,.05); pointer-events:none; }
  .h-free-box h2 { font-family:'Playfair Display',serif; font-size:clamp(1.5rem,2.5vw,2rem); font-weight:900; color:#fff; margin-bottom:10px; }
  .h-free-box h2 em { font-style:normal; color:var(--accent); }
  .h-free-box p { color:rgba(255,255,255,.72); font-size:.93rem; line-height:1.65; margin-bottom:24px; }
  .h-btn-free { display:inline-block; background:var(--accent); color:var(--primary); padding:13px 28px; border-radius:50px; font-weight:700; font-size:.92rem; border:none; cursor:pointer; transition:all .18s; box-shadow:0 4px 16px rgba(221,161,94,.4); font-family:'DM Sans',sans-serif; }
  .h-btn-free:hover { background:var(--cta); color:#fff; transform:translateY(-2px); }
  .h-free-books-row { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
  .h-free-mini { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15); border-radius:14px; overflow:hidden; cursor:pointer; transition:all .18s; }
  .h-free-mini:hover { background:rgba(255,255,255,.18); transform:translateY(-2px); }
  .h-free-mini img { width:100%; height:120px; object-fit:cover; }
  .h-free-mini-info { padding:10px 12px; }
  .h-free-mini-title { font-size:.82rem; font-weight:700; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .h-free-mini-auth { font-size:.72rem; color:rgba(255,255,255,.6); }

  /* Value props */
  .h-value-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
  .h-value-card { background:var(--card); border:1.5px solid var(--border); border-radius:20px; padding:28px 22px; transition:all .2s; }
  .h-value-card:hover { transform:translateY(-4px); box-shadow:0 10px 28px rgba(19,73,60,.1); border-color:var(--accent); }
  .h-value-icon { font-size:2.2rem; margin-bottom:14px; }
  .h-value-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; color:var(--primary); margin-bottom:6px; }
  .h-value-desc { font-size:.83rem; color:var(--muted); line-height:1.6; }

  /* CTA Banner */
  .h-cta-banner { background:var(--primary); padding:80px 5%; text-align:center; }
  .h-cta-inner { max-width:640px; margin:0 auto; }
  .h-cta-inner h2 { font-family:'Playfair Display',serif; font-size:clamp(1.7rem,3vw,2.4rem); font-weight:900; color:#fff; margin-bottom:12px; }
  .h-cta-inner p { color:rgba(255,255,255,.68); font-size:.97rem; line-height:1.7; margin-bottom:32px; }
  .h-cta-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }

  /* Footer */
  .h-footer { background:#0d2e26; color:rgba(255,250,224,.75); padding:56px 5% 28px; font-family:'DM Sans',sans-serif; }
  .h-footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:40px; margin-bottom:48px; }
  .h-f-brand { display:inline-flex; align-items:center; gap:8px; margin-bottom:14px; text-decoration:none; }
  .h-f-logo-icon { width:44px; height:44px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .h-f-logo-icon img { width:100%; height:100%; object-fit:contain; display:block; }
  .h-f-brand-name { font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:700; color:#FFFAE0; }
  .h-f-desc { font-size:.86rem; line-height:1.7; max-width:260px; }
  .h-f-social { display:flex; gap:10px; margin-top:16px; }
  .h-f-soc { width:34px; height:34px; border-radius:50%; background:rgba(255,250,224,.08); display:grid; place-items:center; font-size:.82rem; cursor:pointer; transition:background .15s; border:none; color:rgba(255,250,224,.75); font-family:'DM Sans',sans-serif; }
  .h-f-soc:hover { background:rgba(255,250,224,.16); }
  .h-footer-col h4 { font-family:'Playfair Display',serif; font-size:.93rem; font-weight:700; color:#FFFAE0; margin-bottom:14px; }
  .h-footer-col ul { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:9px; }
  .h-footer-col ul li a { font-size:.84rem; color:rgba(255,250,224,.65); transition:color .15s; cursor:pointer; }
  .h-footer-col ul li a:hover { color:#FFFAE0; }
  .h-footer-bottom { border-top:1px solid rgba(255,250,224,.08); padding-top:24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; font-size:.82rem; }
  .h-footer-bottom-links { display:flex; gap:20px; }
  .h-footer-bottom-links a { color:rgba(255,250,224,.5); cursor:pointer; }
  .h-footer-bottom-links a:hover { color:rgba(255,250,224,.8); }

  /* Login Popup */
  .h-popup-overlay { position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:200; display:grid; place-items:center; opacity:0; pointer-events:none; transition:opacity .25s; backdrop-filter:blur(4px); }
  .h-popup-overlay.show { opacity:1; pointer-events:all; }
  .h-popup-box { background:var(--bg); border-radius:24px; padding:40px 36px; max-width:400px; width:90%; text-align:center; box-shadow:0 24px 64px rgba(0,0,0,.25); transform:scale(.9); transition:transform .25s cubic-bezier(.34,1.56,.64,1); }
  .h-popup-overlay.show .h-popup-box { transform:scale(1); }
  .h-popup-icon { font-size:2.8rem; margin-bottom:12px; }
  .h-popup-title { font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:900; color:var(--primary); margin-bottom:8px; }
  .h-popup-sub { font-size:.9rem; color:var(--muted); line-height:1.6; margin-bottom:24px; }
  .h-popup-btns { display:flex; flex-direction:column; gap:10px; }
  .h-popup-btn-primary { background:var(--primary); color:var(--bg); border:none; padding:13px; border-radius:12px; font-size:.97rem; font-weight:700; cursor:pointer; transition:background .15s; font-family:'DM Sans',sans-serif; }
  .h-popup-btn-primary:hover { background:#0e3328; }
  .h-popup-btn-ghost { background:transparent; color:var(--text); border:1.5px solid var(--border); padding:12px; border-radius:12px; font-size:.9rem; font-weight:600; cursor:pointer; transition:all .15s; font-family:'DM Sans',sans-serif; }
  .h-popup-btn-ghost:hover { border-color:var(--primary); background:rgba(19,73,60,.04); }

  /* Toast */
  .h-toast { position:fixed; bottom:28px; right:28px; z-index:9999; background:var(--primary); color:var(--bg); padding:11px 18px; border-radius:11px; font-size:.88rem; font-weight:500; display:flex; align-items:center; gap:8px; box-shadow:0 6px 24px rgba(19,73,60,.3); transform:translateY(60px); opacity:0; pointer-events:none; transition:transform .3s cubic-bezier(.34,1.56,.64,1), opacity .3s; font-family:'DM Sans',sans-serif; }
  .h-toast.show { transform:translateY(0); opacity:1; }
`;

const FEATURED_BOOKS = [
  { id: "b1", img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80", type: "rent", cat: "Self-Development", title: "Atomic Habits", author: "James Clear", price: "Rs. 50", unit: "/wk", stars: "★★★★★" },
  { id: "b2", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80", type: "buy", cat: "Programming", title: "Deep Work", author: "Cal Newport", price: "Rs. 350", stars: "★★★★★" },
  { id: "b3", img: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&q=80", type: "free", cat: "Science", title: "Sapiens", author: "Yuval Noah Harari", price: "free", stars: "★★★★☆" },
  { id: "b4", img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80", type: "rent", cat: "Self-Development", title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", price: "Rs. 40", unit: "/wk", stars: "★★★★☆" },
  { id: "b5", img: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80", type: "rent", cat: "Novels", title: "The Alchemist", author: "Paulo Coelho", price: "Rs. 30", unit: "/wk", stars: "★★★★★" },
];

const HOW_STEPS = [
  { num: "1", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>, title: "Browse Listings", desc: "Search books by title, category, or location across Islamabad." },
  { num: "2", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>, title: "Send a Request", desc: "Contact the owner or seller with a single tap." },
  { num: "3", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, title: "Meet & Exchange", desc: "Meet at a convenient spot to buy, rent, or pick up." },
  { num: "4", icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>, title: "Enjoy Reading", desc: "Dive into your new book. Return rentals on time to earn trust." },
];

const CATEGORIES = [
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>, name: "Novels", count: "120+ books" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>, name: "Computer Science", count: "80+ books" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 3h15"></path><path d="M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"></path><path d="M6 14h12"></path></svg>, name: "Science", count: "95+ books" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12a3 3 0 0 1-3 3H5a2 2 0 0 0-2 2h18a2 2 0 0 0-2-2h-4a3 3 0 0 1-3-3V3z"></path></svg>, name: "Islamic Books", count: "70+ books" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path><path d="M12 6a4 4 0 0 1 4 4c0 2-3 5-4 5s-4-3-4-5a4 4 0 0 1 4-4z"></path></svg>, name: "Self-Help", count: "85+ books" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>, name: "Mathematics", count: "60+ books" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>, name: "Art Books", count: "45+ books" },
  { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>, name: "History", count: "55+ books" },
];

const VALUE_PROPS = [
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>, title: "Affordable Reads", desc: "Rent books for as low as Rs. 30/week. Save money while reading more." },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1L9 7m5 9.9l-.8.9A7 7 0 0 1 13 4"></path><polyline points="7 10 9 7 6 5"></polyline><polyline points="17 14 15 17 18 19"></polyline></svg>, title: "Sustainable Sharing", desc: "Give your used books a second life. Reduce waste, spread knowledge." },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>, title: "Local Community", desc: "Connect with readers in your area. Exchange in person, safely." },
  { icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>, title: "Free Book Shelf", desc: "Find books being given away free. Pay it forward when you're done." },
];

const FREE_BOOKS = [
  { img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80", title: "Atomic Habits", auth: "James Clear" },
  { img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&q=80", title: "Deep Work", auth: "Cal Newport" },
  { img: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&q=80", title: "Sapiens", auth: "Y.N. Harari" },
  { img: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80", title: "The Alchemist", auth: "Paulo Coelho" },
];

export default function Home({ onNavigate }) {
  const [showPopup, setShowPopup] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();
  const cartCount = cart ? cart.length : 0;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:image')) return imagePath;
    return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const [featRes, recentRes] = await Promise.all([
          api.get('books?limit=8'),
          api.get('books?limit=8&sort=recent')
        ]);
        
        const formatBooks = (booksArr, max) => {
          return booksArr.slice(0, max).map(b => ({
            id: b._id,
            img: getImageUrl(b.image || (b.images && b.images[0])),
            type: b.exchangeType === 'Sell' ? 'buy' : b.exchangeType === 'Rent' ? 'rent' : 'free',
            cat: b.category,
            title: b.title,
            author: b.author,
            price: b.exchangeType === 'Share' ? 'free' : `Rs. ${b.price}`,
            unit: b.exchangeType === 'Rent' ? '/wk' : '',
            stars: '★★★★★'
          }));
        };

        if (featRes.data.books && featRes.data.books.length > 0) {
            setFeaturedBooks(formatBooks(featRes.data.books, 8));
        } else {
            setFeaturedBooks(FEATURED_BOOKS);
        }

        if (recentRes.data.books && recentRes.data.books.length > 0) {
            setRecentBooks(formatBooks(recentRes.data.books, 8));
        } else {
            setRecentBooks(FEATURED_BOOKS);
        }

      } catch (error) {
        console.error("Failed to fetch books", error);
        setFeaturedBooks(FEATURED_BOOKS);
        setRecentBooks(FEATURED_BOOKS);
      }
    };
    fetchBooks();
  }, []);

  const showToast = useCallback((msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2600);
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div style={{ background: "var(--bg)", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>

        {/* Navbar */}
        <nav className="h-navbar">
          <div className="h-logo" onClick={() => navigate('/home')}>
            <div className="h-logo-icon">
                <img src={IMAGES.img_0} alt="BookCycle" />
            </div>
            <span className="h-logo-text">BookCycle</span>
          </div>

          <ul className="h-nav-links">
            <li><button className="h-nav-link" onClick={() => navigate('/browse')}>Browse</button></li>
            <li><button className="h-nav-link" onClick={() => navigate('/seller')}>Sell</button></li>
            <li>
                <button className="h-nav-link" onClick={() => navigate('/cart')} style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '7px 10px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    {cartCount > 0 && (
                        <span style={{ 
                            position: 'absolute', top: '0', right: '0', 
                            background: 'var(--accent)', color: 'var(--primary)', 
                            fontSize: '0.65rem', fontWeight: 'bold', 
                            padding: '1px 5px', borderRadius: '10px' 
                        }}>{cartCount}</span>
                    )}
                </button>
            </li>
            <li><button className="h-nav-cta" onClick={() => onNavigate?.("login")}>Login</button></li>
          </ul>
        </nav>

        {/* Hero */}
        <section className="h-hero">
          <div className="h-hero-inner">
            <div style={{ animation: "fadeUp .5s ease both" }}>
              <div className="h-hero-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                Islamabad's Book Community
              </div>
              <h1 className="h-hero-title">Share, Rent, and<br /><em>Discover Books</em><br />Around You</h1>
              <p className="h-hero-sub">Find affordable books, rent for short-term use, or share yours with others. Over 900+ books available across Islamabad.</p>
              <div className="h-hero-btns">
                <button className="h-btn-primary" onClick={() => navigate('/browse')}>Browse Books</button>
                <button className="h-btn-outline" onClick={() => onNavigate?.("register")}>Join BookCycle</button>
              </div>
              <div className="h-hero-stats">
                {[["900+", "Books Listed"], ["400+", "Active Readers"], ["120+", "Free Books"]].map(([num, label]) => (
                  <div key={label}>
                    <div className="h-stat-num">{num}</div>
                    <div className="h-stat-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-hero-visual" style={{ animation: "fadeUp .5s ease .15s both" }}>
              <div className="h-books-stack">
                <div className="h-book-thumb"><img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80" alt="" /></div>
                <div className="h-book-thumb"><img src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&q=80" alt="" /></div>
                <div className="h-book-thumb"><img src="https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&q=80" alt="" /></div>
                <div className="h-book-thumb"><img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80" alt="" /></div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Books */}
        <section className="h-section">
          <div className="h-section-inner">
            <div className="h-section-head">
              <div>
                <div className="h-section-tag">✦ Available Now</div>
                <h2 className="h-section-title">Featured <em>Books</em></h2>
                <p className="h-section-sub" style={{ marginBottom: 0 }}>Discover books available to buy, rent, or claim for free today.</p>
              </div>
              <button className="h-see-all">See all books →</button>
            </div>
            <div className="h-books-grid">
              {featuredBooks.map(b => (
                <div key={b.id} className="h-bcard" onClick={() => navigate(`/book/${b.id}`)}>
                  <div className="h-bcard-img">
                    <img src={b.img} alt={b.title} />
                    <span className={`h-badge h-badge-${b.badge}`}>{b.badge.charAt(0).toUpperCase() + b.badge.slice(1)}</span>
                  </div>
                  <div className="h-bcard-body">
                    <div className="h-bcat">{b.cat}</div>
                    <div className="h-btitle">{b.title}</div>
                    <div className="h-bauthor">by {b.author}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      <div className="h-bprice">Rs. 30/wk</div>
                      <button className="btn-mini-cart" onClick={(e) => { 
                        e.stopPropagation(); 
                        const added = addToCart(b);
                        if (added) showToast(`"${b.title}" added to cart!`);
                        else showToast("Item already in cart");
                      }} title="Add to Cart" style={{ color: '#fff' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                      </button>
                    </div>
                    <div className="h-bstars">{b.stars}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recently Added Books */}
        <section className="h-section alt">
          <div className="h-section-inner">
            <div className="h-section-head">
              <div>
                <div className="h-section-tag">✦ Fresh Arrivals</div>
                <h2 className="h-section-title">Recently <em>Added</em></h2>
                <p className="h-section-sub" style={{ marginBottom: 0 }}>Be the first to buy, rent, or claim these new listings.</p>
              </div>
              <button className="h-see-all">See all new →</button>
            </div>
            <div className="h-books-grid">
              {recentBooks.map(b => (
                <div key={b.id} className="h-bcard" onClick={() => navigate(`/book/${b.id}`)}>
                  <div className="h-bcard-img">
                    <img src={b.img} alt={b.title} />
                    <span className={`h-badge h-badge-${b.badge}`}>{b.badge.charAt(0).toUpperCase() + b.badge.slice(1)}</span>
                  </div>
                  <div className="h-bcard-body">
                    <div className="h-bcat">{b.cat}</div>
                    <div className="h-btitle">{b.title}</div>
                    <div className="h-bauthor">by {b.author}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      <div className="h-bprice">{b.type === "free" ? <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg> Free</span> : `Rs. ${b.price}`}</div>
                       <button className="btn-mini-cart" onClick={(e) => { 
                        e.stopPropagation(); 
                        const added = addToCart(b);
                        if (added) showToast(`"${b.title}" added to cart!`);
                        else showToast("Item already in cart");
                      }} title="Add to Cart" style={{ color: '#fff' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                      </button>
                    </div>
                    <div className="h-bstars" style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i < Math.floor(b.stars.length) ? "var(--accent)" : "none"} stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="h-section">
          <div className="h-section-inner">
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div className="h-section-tag" style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}><path d="M12 2l10 10-10 10-10-10z"/></svg> 
                Simple Process
              </div>
              <h2 className="h-section-title">How BookCycle <em>Works</em></h2>
              <p className="h-section-sub">Four easy steps to start reading more for less.</p>
            </div>
            <div className="h-how-grid">
              {HOW_STEPS.map(s => (
                <div key={s.num} className="h-how-card">
                  <div className="h-how-circle">{s.icon}</div>
                  <div className="h-how-title">{s.title}</div>
                  <div className="h-how-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="h-section alt">
          <div className="h-section-inner">
            <div className="h-section-head">
              <div>
                <div className="h-section-tag" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}><path d="M12 2l10 10-10 10-10-10z"/></svg> 
                  Explore
                </div>
                <h2 className="h-section-title">Browse by <em>Category</em></h2>
              </div>
              <button className="h-see-all">All categories →</button>
            </div>
            <div className="h-cats-grid">
              {CATEGORIES.map(c => (
                <div key={c.name} className="h-cat-pill">
                  <span className="h-cat-icon">{c.icon}</span>
                  <div>
                    <div className="h-cat-name">{c.name}</div>
                    <div className="h-cat-count">{c.count}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Free Shelf */}
        <section className="h-section">
          <div className="h-section-inner">
            <div className="h-free-box">
              <div className="h-free-box-icon">
                <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
              </div>
              <div>
                <h2>The <em>Free Shelf</em> — Books That Find New Homes</h2>
                <p>Community members donate books they've finished. Browse free listings and claim yours before they're gone.</p>
                <button className="h-btn-free" onClick={() => setShowPopup(true)}>Claim a Free Book</button>
              </div>
              <div className="h-free-books-row">
                {FREE_BOOKS.map(b => (
                  <div key={b.title} className="h-free-mini" onClick={() => setShowPopup(true)}>
                    <img src={b.img} alt={b.title} />
                    <div className="h-free-mini-info">
                      <div className="h-free-mini-title">{b.title}</div>
                      <div className="h-free-mini-auth">{b.auth}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="h-section alt">
          <div className="h-section-inner">
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div className="h-section-tag" style={{ textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.8 }}><path d="M12 2l10 10-10 10-10-10z"/></svg> 
                {/* Text follows here depending on context, I'll make it generic or split */}
                Why BookCycle
              </div>
              <h2 className="h-section-title">Built for <em>Readers</em></h2>
              <p className="h-section-sub">Everything you need to read more, spend less, and share the joy of books.</p>
            </div>
            <div className="h-value-grid">
              {VALUE_PROPS.map(v => (
                <div key={v.title} className="h-value-card">
                  <div className="h-value-icon">{v.icon}</div>
                  <div className="h-value-title">{v.title}</div>
                  <div className="h-value-desc">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="h-cta-banner">
          <div className="h-cta-inner">
            <h2>Ready to Start Reading<br />for Less?</h2>
            <p>Join thousands of readers in Islamabad who are sharing, renting, and discovering books through BookCycle.</p>
            <div className="h-cta-btns">
              <button className="h-btn-primary" onClick={() => onNavigate?.("register")}>Create Free Account</button>
              <button className="h-btn-outline">Browse Books</button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="h-footer">
          <div className="h-footer-grid">
            <div>
              <div className="h-f-brand">
                <div className="h-f-logo-icon">
                  <img src={IMAGES.img_0} alt="BookCycle" />
                </div>
                <span className="h-f-brand-name">BookCycle</span>
              </div>
              <p className="h-f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p>
              <div className="h-f-social">
                <button className="h-f-soc"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></button>
                <button className="h-f-soc"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></button>
                <button className="h-f-soc"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></button>
                <button className="h-f-soc"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></button>
              </div>
            </div>
            <div className="h-footer-col">
              <h4>Platform</h4>
              <ul>
                <li><a onClick={() => navigate('/browse')}>Browse Books</a></li>
                <li><a onClick={() => navigate('/browse?tab=rent')}>Rent a Book</a></li>
                <li><a onClick={() => navigate('/browse?tab=free')}>Free Shelf</a></li>
                <li><a onClick={() => navigate('/seller')}>Sell Your Book</a></li>
              </ul>
            </div>
            <div className="h-footer-col">
              <h4>Account</h4>
              <ul>
                <li><a onClick={() => onNavigate?.("login")}>Sign In</a></li>
                <li><a onClick={() => onNavigate?.("register")}>Create Account</a></li>
                <li><a onClick={() => onNavigate?.("forgot")}>Forgot Password</a></li>
                <li><a href="#">Dashboard</a></li>
              </ul>
            </div>
            <div className="h-footer-col">
              <h4>Contact</h4>
              <ul>
                {["hello@bookcycle.pk", "+92 300 1234567", "F-7, Islamabad", "Help Center"].map(l => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
          </div>
          <div className="h-footer-bottom">
            <p>© 2025 BookCycle. All rights reserved.</p>
            <div className="h-footer-bottom-links">
              {["Privacy", "Terms", "Cookies"].map(l => <a key={l} href="#">{l}</a>)}
            </div>
          </div>
        </footer>
      </div>

      {/* Login Popup */}
      <div className={`h-popup-overlay${showPopup ? " show" : ""}`} onClick={e => e.target.classList.contains("h-popup-overlay") && setShowPopup(false)}>
        <div className="h-popup-box">
          <div className="h-popup-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--cta)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <div className="h-popup-title">Login to Continue</div>
          <div className="h-popup-sub">Create a free account or sign in to add books to your cart, request free books, and more.</div>
          <div className="h-popup-btns">
            <button className="h-popup-btn-primary" onClick={() => { setShowPopup(false); onNavigate?.("login"); }}>Sign In</button>
            <button className="h-popup-btn-ghost" onClick={() => { setShowPopup(false); onNavigate?.("register"); }}>Create Free Account</button>
            <button className="h-popup-btn-ghost" onClick={() => setShowPopup(false)}>Continue Browsing</button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`h-toast${toast.show ? " show" : ""}`}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
        <span>{toast.msg}</span>
      </div>
    </>
  );
}
