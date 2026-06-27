import React, { useEffect, useState } from "react";
import Image from "../assets/image.png";
import Logo from "../assets/logo.png";
import { FaEye } from "react-icons/fa6";
import { FaEyeSlash } from "react-icons/fa6";
import "../styles/Register.css";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api, getApiErrorMessage } from "../api/client";
import { getStoredAuthToken } from "../utils/authStorage";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [token, setToken] = useState(getStoredAuthToken);
  const [inlineError, setInlineError] = useState("");
  const [role, setRole] = useState("");
  const [interests, setInterests] = useState([]);

  const handleInterestChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setInterests([...interests, value]);
    } else {
      setInterests(interests.filter((i) => i !== value));
    }
  };



  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setInlineError("");
    let name = e.target.name.value.trim();
    let lastname = e.target.lastname.value.trim();
    let email = e.target.email.value.trim();
    let password = e.target.password.value;
    let confirmPassword = e.target.confirmPassword.value;

    if (name.length === 0 || lastname.length === 0 || email.length === 0 || password.length === 0 || confirmPassword.length === 0) {
      setInlineError("Please fill all required fields");
      // toast.error("Please fill all inputs"); /* unused */
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|pk|org|net|edu|gov)$/i;
    const isBadGmail = /@gmai\.com|@gmial\.com|@gamil\.com/i.test(email);

    if (!emailRegex.test(email) || isBadGmail) {
      setInlineError("Please enter a valid email address");
      return;
    }

    if (!role) {
      setInlineError("Please select a role");
      // toast.error("Please select a role"); /* unused */
      return;
    }
    if (interests.length === 0) {
      setInlineError("Please select at least one interest");
      // toast.error("Please select at least one interest"); /* unused */
      return;
    }

    if (password !== confirmPassword) {
      setInlineError("Passwords don't match");
      // toast.error("Passwords don't match"); /* unused */
      return;
    }

    const formData = {
      name: `${name} ${lastname}`.trim(),
      email,
      password,
      role,
      interests
    };
    try {
      await api.post("/register", formData);
      navigate("/login");
    } catch (err) {
      setInlineError(getApiErrorMessage(err));
      // toast.error(getApiErrorMessage(err)); /* unused */
    }
  }

  useEffect(() => {
    if (token !== "") {
      navigate("/home");
    }
  }, []);

  return (
    <div className="register-main">
      <div className="register-left">
        <img src={Image} alt="" />
      </div>
      <div className="register-right">
        <div className="register-right-container">
          <div className="register-logo">
            <img src={Logo} alt="" />
          </div>
          <div className="register-center">
            <h2>Welcome to our website!</h2>
            <p>Please enter your details</p>
            <form onSubmit={handleRegisterSubmit}>
              {inlineError && <div style={{ color: '#d32f2f', background: '#ffebee', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #ffcdd2' }}>{inlineError}</div>}
              <input type="text" placeholder="Name" name="name" />
              <input type="text" placeholder="Lastname" name="lastname" />
              <input type="email" placeholder="Email" name="email" />
              <div className="pass-input-div">
                <input type={showPassword ? "text" : "password"} placeholder="Password" name="password" />
                {showPassword ? <FaEyeSlash onClick={() => { setShowPassword(!showPassword) }} /> : <FaEye onClick={() => { setShowPassword(!showPassword) }} />}

              </div>
              <div className="pass-input-div">
                <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" name="confirmPassword" />
                {showPassword ? <FaEyeSlash onClick={() => { setShowPassword(!showPassword) }} /> : <FaEye onClick={() => { setShowPassword(!showPassword) }} />}
              </div>

              <div className="role-selection">
                <p>Role *</p>
                <div className="role-options">
                  <label>
                    <input type="radio" name="role" value="customer" checked={role === "customer"} onChange={(e) => setRole(e.target.value)} />
                    Customer
                  </label>
                  <label>
                    <input type="radio" name="role" value="shopkeeper" checked={role === "shopkeeper"} onChange={(e) => setRole(e.target.value)} />
                    Shopkeeper
                  </label>
                </div>
              </div>

              <div className="interests-selection">
                <p>Interests *</p>
                <div className="interests-options">
                  {["Programming", "Science", "Physics", "Self Development", "Algebra", "Mathematics", "Novels", "Notes"].map((cat) => (
                    <label key={cat}>
                      <input type="checkbox" value={cat} checked={interests.includes(cat)} onChange={handleInterestChange} />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <div className="register-center-buttons">
                <button type="submit">Sign Up</button>
              </div>
            </form>
          </div>

          <p className="register-bottom-p">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
