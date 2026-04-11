import { useState, useCallback } from "react";
import logoImg from "../assets/image.png";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --primary: #13493C;
    --secondary: #606C38;
    --bg: #FFFAE0;
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
  .h-navbar { background:var(--primary); display:flex; align-items:center; justify-content:space-between; padding:0 5%; height:72px; box-shadow:0 2px 16px rgba(19,73,60,.25); position:sticky; top:0; z-index:100; }
  .h-logo { display:flex; align-items:center; gap:8px; cursor:pointer; }
  .h-logo-circle { width:44px; height:44px; border-radius:50%; background:var(--bg); display:grid; place-items:center; font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:900; color:var(--primary); }
  .h-logo-text { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:700; color:var(--bg); }
  .h-nav-links { display:flex; align-items:center; gap:6px; }
  .h-nav-link { color:rgba(255,250,224,.8); font-size:.88rem; font-weight:500; padding:7px 14px; border-radius:8px; transition:all .15s; background:none; border:none; font-family:'DM Sans',sans-serif; cursor:pointer; }
  .h-nav-link:hover { color:var(--bg); background:rgba(255,250,224,.1); }
  .h-nav-search { display:flex; align-items:center; gap:9px; background:rgba(255,250,224,.1); border:1px solid rgba(255,250,224,.2); border-radius:50px; padding:7px 16px; }
  .h-nav-search input { background:transparent; border:none; outline:none; color:var(--bg); font-size:.87rem; width:160px; font-family:'DM Sans',sans-serif; }
  .h-nav-search input::placeholder { color:rgba(255,250,224,.5); }
  .h-btn-ghost { background:transparent; border:1.5px solid rgba(255,250,224,.35); color:var(--bg); padding:8px 18px; border-radius:8px; font-weight:600; font-size:.87rem; cursor:pointer; transition:all .15s; font-family:'DM Sans',sans-serif; }
  .h-btn-ghost:hover { background:rgba(255,250,224,.1); border-color:rgba(255,250,224,.6); }
  .h-btn-solid { background:var(--accent); color:var(--primary); padding:8px 20px; border-radius:8px; font-weight:700; font-size:.87rem; border:none; cursor:pointer; transition:all .15s; font-family:'DM Sans',sans-serif; }
  .h-btn-solid:hover { background:var(--cta); color:#fff; }

  /* Hero */
  .h-hero { background:linear-gradient(135deg,var(--primary) 0%,#1a5e4a 60%,#0f3d2d 100%); padding:80px 5% 90px; position:relative; overflow:hidden; }
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
  .h-how-num { width:44px; height:44px; border-radius:50%; background:var(--primary); color:var(--bg); font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:900; display:grid; place-items:center; margin:0 auto 14px; }
  .h-how-icon { font-size:1.6rem; margin-bottom:10px; }
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
  .h-free-box::before { content:'🎁'; position:absolute; right:30px; top:20px; font-size:8rem; opacity:.06; pointer-events:none; }
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
  .h-f-brand { display:inline-flex; align-items:center; gap:8px; margin-bottom:14px; }
  .h-f-logo-circle { width:40px; height:40px; border-radius:50%; background:var(--bg); display:grid; place-items:center; font-family:'Playfair Display',serif; font-size:1rem; font-weight:900; color:var(--primary); }
  .h-f-brand-name { font-family:'Playfair Display',serif; font-size:1.3rem; font-weight:700; color:#FFFAE0; }
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
  { id: "b1", img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80", badge: "rent", cat: "Self-Development", title: "Atomic Habits", author: "James Clear", price: "Rs. 50", unit: "/wk", stars: "★★★★★" },
  { id: "b2", img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80", badge: "buy", cat: "Programming", title: "Deep Work", author: "Cal Newport", price: "Rs. 350", stars: "★★★★★" },
  { id: "b3", img: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&q=80", badge: "free", cat: "Science", title: "Sapiens", author: "Yuval Noah Harari", price: "free", stars: "★★★★☆" },
  { id: "b4", img: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80", badge: "rent", cat: "Self-Development", title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", price: "Rs. 40", unit: "/wk", stars: "★★★★☆" },
  { id: "b5", img: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80", badge: "rent", cat: "Novels", title: "The Alchemist", author: "Paulo Coelho", price: "Rs. 30", unit: "/wk", stars: "★★★★★" },
];

const HOW_STEPS = [
  { num: "1", icon: "🔍", title: "Browse Listings", desc: "Search books by title, category, or location across Islamabad." },
  { num: "2", icon: "📩", title: "Send a Request", desc: "Contact the owner or seller with a single tap." },
  { num: "3", icon: "🤝", title: "Meet & Exchange", desc: "Meet at a convenient spot to buy, rent, or pick up." },
  { num: "4", icon: "📚", title: "Enjoy Reading", desc: "Dive into your new book. Return rentals on time to earn trust." },
];

const CATEGORIES = [
  { icon: "📖", name: "Novels", count: "120+ books" },
  { icon: "💻", name: "Computer Science", count: "80+ books" },
  { icon: "🔬", name: "Science", count: "95+ books" },
  { icon: "🕌", name: "Islamic Books", count: "70+ books" },
  { icon: "🧠", name: "Self-Help", count: "85+ books" },
  { icon: "📐", name: "Mathematics", count: "60+ books" },
  { icon: "🎨", name: "Art Books", count: "45+ books" },
  { icon: "📜", name: "History", count: "55+ books" },
];

const VALUE_PROPS = [
  { icon: "💰", title: "Affordable Reads", desc: "Rent books for as low as Rs. 30/week. Save money while reading more." },
  { icon: "🌱", title: "Sustainable Sharing", desc: "Give your used books a second life. Reduce waste, spread knowledge." },
  { icon: "📍", title: "Local Community", desc: "Connect with readers in your area. Exchange in person, safely." },
  { icon: "🎁", title: "Free Book Shelf", desc: "Find books being given away free. Pay it forward when you're done." },
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
          <div className="h-logo">
            <div className="h-logo-circle" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={logoImg} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span className="h-logo-text">BookCycle</span>
          </div>
          <div className="h-nav-links">
            <button className="h-nav-link">Browse Books</button>
            <button className="h-nav-link">Rent</button>
            <button className="h-nav-link">Free Shelf</button>
            <button className="h-nav-link">Sell</button>
          </div>
          <div className="h-nav-search">
            <span style={{ color: "rgba(255,250,224,.6)" }}>🔍</span>
            <input placeholder="Search books, authors..." />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="h-btn-ghost" onClick={() => onNavigate?.("login")}>Sign In</button>
            <button className="h-btn-solid" onClick={() => onNavigate?.("register")}>Join Free</button>
          </div>
        </nav>

        {/* Hero */}
        <section className="h-hero">
          <div className="h-hero-inner">
            <div style={{ animation: "fadeUp .5s ease both" }}>
              <div className="h-hero-label">📚 Islamabad's Book Community</div>
              <h1 className="h-hero-title">Share, Rent, and<br /><em>Discover Books</em><br />Around You</h1>
              <p className="h-hero-sub">Find affordable books, rent for short-term use, or share yours with others. Over 900+ books available across Islamabad.</p>
              <div className="h-hero-btns">
                <button className="h-btn-primary">Browse Books</button>
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
              {FEATURED_BOOKS.map(b => (
                <div key={b.id} className="h-bcard">
                  <div className="h-bcard-img">
                    <img src={b.img} alt={b.title} />
                    <span className={`h-badge h-badge-${b.badge}`}>{b.badge.charAt(0).toUpperCase() + b.badge.slice(1)}</span>
                  </div>
                  <div className="h-bcard-body">
                    <div className="h-bcat">{b.cat}</div>
                    <div className="h-btitle">{b.title}</div>
                    <div className="h-bauthor">by {b.author}</div>
                    {b.price === "free"
                      ? <div className="h-bprice free">🎁 Free Shelf</div>
                      : <div className="h-bprice">{b.price}{b.unit && <span style={{ fontSize: ".72rem", color: "var(--muted)", fontWeight: 500 }}>{b.unit}</span>}</div>
                    }
                    <div className="h-bstars">{b.stars}</div>
                    <div className="h-bactions">
                      <button className="h-btn-details">View Details</button>
                      <button className="h-btn-cart" onClick={() => setShowPopup(true)}>
                        {b.badge === "free" ? "Request Free" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="h-section alt">
          <div className="h-section-inner">
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div className="h-section-tag" style={{ textAlign: "center" }}>✦ Simple Process</div>
              <h2 className="h-section-title">How BookCycle <em>Works</em></h2>
              <p className="h-section-sub">Four easy steps to start reading more for less.</p>
            </div>
            <div className="h-how-grid">
              {HOW_STEPS.map(s => (
                <div key={s.num} className="h-how-card">
                  <div className="h-how-num">{s.num}</div>
                  <div className="h-how-icon">{s.icon}</div>
                  <div className="h-how-title">{s.title}</div>
                  <div className="h-how-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="h-section">
          <div className="h-section-inner">
            <div className="h-section-head">
              <div>
                <div className="h-section-tag">✦ Explore</div>
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
        <section className="h-section alt">
          <div className="h-section-inner">
            <div className="h-free-box">
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
        <section className="h-section">
          <div className="h-section-inner">
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div className="h-section-tag" style={{ textAlign: "center" }}>✦ Why BookCycle</div>
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
                <div className="h-f-logo-circle" style={{ overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={logoImg} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span className="h-f-brand-name">BookCycle</span>
              </div>
              <p className="h-f-desc">Islamabad's community book platform. Share, rent, and discover books across the city.</p>
              <div className="h-f-social">
                {["𝕏", "f", "in", "📷"].map((s, i) => <button key={i} className="h-f-soc">{s}</button>)}
              </div>
            </div>
            <div className="h-footer-col">
              <h4>Platform</h4>
              <ul>
                {["Browse Books", "Rent a Book", "Free Shelf", "Sell Your Book"].map(l => <li key={l}><a href="#">{l}</a></li>)}
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
          <div className="h-popup-icon">🔒</div>
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
