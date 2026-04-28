import React, { useEffect, useState } from "react";
import Image from "../assets/image.png";
import Logo from "../assets/logo.png";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api, getApiErrorMessage } from "../api/client";
import { getStoredAuthToken } from "../utils/authStorage";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const { login, token } = useAuth();
  const navigate = useNavigate();



  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setInlineError("");
    let email = e.target.email.value.trim();
    let password = e.target.password.value;

    if (email.length === 0 || password.length === 0) {
      setInlineError("Please fill all required fields");
      // toast.error("Please fill all inputs"); // unused
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|pk|org|net|edu|gov)$/i;
    const isBadGmail = /@gmai\.com|@gmial\.com|@gamil\.com/i.test(email);

    if (!emailRegex.test(email) || isBadGmail) {
      setInlineError("Please enter a valid email address");
      return;
    }

    const formData = {
      email,
      password,
    };
    try {
      const response = await api.post("/login", formData);
      login(response.data.token);
      navigate("/home");
    } catch (err) {
      console.log(err);
      setInlineError(getApiErrorMessage(err));
      // toast.error(getApiErrorMessage(err)); // unused
    }
  };


  useEffect(() => {
    if(token !== ""){
      navigate("/home");
    }
  }, []);

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
            <h2>Welcome back!</h2>
            <p>Please enter your details</p>
            <form onSubmit={handleLoginSubmit}>
              {inlineError && <div style={{ color: '#d32f2f', background: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #ffcdd2' }}>{inlineError}</div>}
              <input type="email" placeholder="Email" name="email" />
              <div className="pass-input-div">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                />
                {showPassword ? (
                  <FaEyeSlash
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  />
                ) : (
                  <FaEye
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                  />
                )}
              </div>

              <div className="login-center-options">
                <div className="remember-div">
                  <input type="checkbox" id="remember-checkbox" />
                  <label htmlFor="remember-checkbox">
                    Remember for 30 days
                  </label>
                </div>
                <Link to="/forgot-password" className="forgot-pass-link">
                  Forgot password?
                </Link>
              </div>
              <div className="login-center-buttons">
                <button type="submit">Log In</button>
              </div>
            </form>
          </div>

          <p className="login-bottom-p">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
