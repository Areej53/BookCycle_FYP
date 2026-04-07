import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ✅ FIXED: Properly closed template string */
const styles = `
  body { margin:0; }
  .h-navbar { background:#13493C; padding:15px; color:white; display:flex; justify-content:space-between; }
  .h-btn-solid { background:#DDA15E; padding:8px 15px; border:none; cursor:pointer; }
  .h-btn-ghost { background:transparent; border:1px solid white; color:white; padding:8px 15px; cursor:pointer; }
  .h-hero { padding:60px; text-align:center; background:#13493C; color:white; }
  .h-btn-primary { background:#DDA15E; padding:10px 20px; border:none; cursor:pointer; }
  .h-toast { position:fixed; bottom:20px; right:20px; background:#13493C; color:white; padding:10px; border-radius:8px; opacity:0; transition:.3s; }
  .h-toast.show { opacity:1; }
`;

export default function Landing() {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: "" });

  const showToast = useCallback((msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  }, []);

  const handleNavigate = (path) => {
    if (path === "login") navigate("/login");
    else if (path === "register") navigate("/register");
    else if (path === "forgot") navigate("/forgot-password");
  };

  return (
    <>
      {/* ✅ FIXED style injection */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div style={{ minHeight: "100vh", background: "#FFFAE0" }}>

        {/* Navbar */}
        <nav className="h-navbar">
          <div>📚 BookCycle</div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="h-btn-ghost" onClick={() => handleNavigate("login")}>
              Sign In
            </button>
            <button className="h-btn-solid" onClick={() => handleNavigate("register")}>
              Join Free
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="h-hero">
          <h1>
            Share, Rent & <br />
            <span style={{ color: "#DDA15E" }}>Discover Books</span>
          </h1>

          <p>Find affordable books around you</p>

          <button
            className="h-btn-primary"
            onClick={() => showToast("Browse Clicked")}
          >
            Browse Books
          </button>
        </section>

      </div>

      {/* Toast */}
      <div className={`h-toast ${toast.show ? "show" : ""}`}>
        {toast.msg}
      </div>
    </>
  );
}