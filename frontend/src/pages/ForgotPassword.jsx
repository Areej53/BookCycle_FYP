import React, { useState } from "react";
import Image from "../assets/image.png";
import Logo from "../assets/logo.png";
import "../styles/Login.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { api, getApiErrorMessage, getApiSuccessMessage } from "../api/client";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [inlineSuccess, setInlineSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError("");
    setInlineSuccess("");
    const email = e.target.email.value.trim();
    if (!email) {
      setInlineError("Please enter your email");
      // toast.error("Please enter your email"); /* unused */
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/forgot-password", { email });
      setInlineSuccess(getApiSuccessMessage(data, "Password reset email sent successfully"));
    } catch (err) {
      setInlineError(getApiErrorMessage(err));
      // toast.error(getApiErrorMessage(err)); /* unused */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-main">
      <div className="login-left">
        <img src={Image} alt="BookCycle illustration" />
      </div>
      <div className="login-right">
        <div className="login-right-container">
          <div className="login-logo">
            <img src={Logo} alt="BookCycle Logo" />
          </div>
          <div className="login-center">
            <h2>Reset password</h2>
            <p>Enter your email and we&apos;ll send reset instructions</p>
            <form onSubmit={handleSubmit}>
              {inlineError && <div style={{ color: '#d32f2f', background: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #ffcdd2' }}>{inlineError}</div>}
              {inlineSuccess && <div style={{ color: '#2e7d32', background: '#e8f5e9', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #c8e6c9' }}>{inlineSuccess}</div>}
              <input type="email" placeholder="Email" name="email" />
              <div className="login-center-buttons">
                <button type="submit" disabled={loading}>
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </div>
            </form>
          </div>
          <p className="login-bottom-p">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
