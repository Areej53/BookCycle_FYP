import React, { useMemo, useState } from "react";
import Image from "../assets/image.png";
import Logo from "../assets/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import "../styles/Login.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api, getApiErrorMessage } from "../api/client";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [inlineSuccess, setInlineSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError("");
    setInlineSuccess("");
    if (!token) {
      setInlineError("Missing reset token. Use the link from your email or dev response.");
      // toast.error("Missing reset token. Use the link from your email or dev response."); /* unused */
      return;
    }
    const password = e.target.password.value;
    const confirm = e.target.confirmPassword.value;
    if (password !== confirm) {
      setInlineError("Passwords do not match");
      // toast.error("Passwords do not match"); /* unused */
      return;
    }
    setLoading(true);
    try {
      await api.post("/reset-password", { token, password });
      setInlineSuccess("Password updated. You can log in.");
      // toast.success("Password updated. You can log in."); /* unused */
      setTimeout(() => navigate("/login"), 1500); // Give user time to see success message before routing
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
        <img src={Image} alt="" />
      </div>
      <div className="login-right">
        <div className="login-right-container">
          <div className="login-logo">
            <img src={Logo} alt="" />
          </div>
          <div className="login-center">
            <h2>Choose a new password</h2>
            <p>Token expires in one hour</p>
            {!token && (
              <p style={{ color: "#c00", marginBottom: "16px" }}>
                No token in URL. Request a new reset from{" "}
                <Link to="/forgot-password">Forgot password</Link>.
              </p>
            )}
            <form onSubmit={handleSubmit}>
              {inlineError && <div style={{ color: '#d32f2f', background: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #ffcdd2' }}>{inlineError}</div>}
              {inlineSuccess && <div style={{ color: '#2e7d32', background: '#e8f5e9', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #c8e6c9' }}>{inlineSuccess}</div>}
              <div className="pass-input-div">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  name="password"
                  minLength={3}
                />
                {showPassword ? (
                  <FaEyeSlash onClick={() => setShowPassword(false)} />
                ) : (
                  <FaEye onClick={() => setShowPassword(true)} />
                )}
              </div>
              <div className="pass-input-div">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  name="confirmPassword"
                  minLength={3}
                />
                {showPassword ? (
                  <FaEyeSlash onClick={() => setShowPassword(false)} />
                ) : (
                  <FaEye onClick={() => setShowPassword(true)} />
                )}
              </div>
              <div className="login-center-buttons">
                <button type="submit" disabled={loading || !token}>
                  {loading ? "Updating…" : "Update password"}
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

export default ResetPassword;
