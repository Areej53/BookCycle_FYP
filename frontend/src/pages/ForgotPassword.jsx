import React, { useState } from "react";
import Image from "../assets/image.png";
import Logo from "../assets/logo.png";
import "../styles/Login.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { api, getApiErrorMessage, getApiSuccessMessage } from "../api/client";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/forgot-password", { email });
      toast.success(
        getApiSuccessMessage(
          data,
          "If an account exists for this email, follow the reset link."
        )
      );
      if (data.resetLink) {
        window.location.assign(data.resetLink);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-main">
      <div className="login-left">
        <img src={Image} alt="" />
      </div>
      <div className="login-right">
        <div className="login-right-container">
          <div className="login-logo">
            <img src={Logo} alt="" />
          </div>
          <div className="login-center">
            <h2>Reset password</h2>
            <p>Enter your email and we&apos;ll send reset instructions</p>
            <form onSubmit={handleSubmit}>
              <input type="email" placeholder="Email" name="email" required />
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
