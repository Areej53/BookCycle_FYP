import React, { useEffect, useState } from "react";
import Image from "../assets/image.png";
import Logo from "../assets/logo.png";
import GoogleSvg from "../assets/icons8-google.svg";
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
    let name = e.target.name.value;
    let lastname = e.target.lastname.value;
    let email = e.target.email.value;
    let password = e.target.password.value;
    let confirmPassword = e.target.confirmPassword.value;

    if(name.length > 0 && lastname.length > 0 && email.length > 0 && password.length > 0 && confirmPassword.length > 0){
      if(!role){
        toast.error("Please select a role");
        return;
      }
      if(interests.length === 0){
        toast.error("Please select at least one interest");
        return;
      }

      if(password === confirmPassword){
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
          toast.error(getApiErrorMessage(err));
        }
      }else{
        toast.error("Passwords don't match");
      }
    

    }else{
      toast.error("Please fill all inputs");
    }


  }

  useEffect(() => {
    if(token !== ""){
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
            <input type="text" placeholder="Name" name="name" required={true} />
            <input type="text" placeholder="Lastname" name="lastname" required={true} />
              <input type="email" placeholder="Email" name="email" required={true} />
              <div className="pass-input-div">
                <input type={showPassword ? "text" : "password"} placeholder="Password" name="password" required={true} />
                {showPassword ? <FaEyeSlash onClick={() => {setShowPassword(!showPassword)}} /> : <FaEye onClick={() => {setShowPassword(!showPassword)}} />}
                
              </div>
              <div className="pass-input-div">
                <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" name="confirmPassword" required={true} />
                {showPassword ? <FaEyeSlash onClick={() => {setShowPassword(!showPassword)}} /> : <FaEye onClick={() => {setShowPassword(!showPassword)}} />}
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
                <button type="submit">
                  <img src={GoogleSvg} alt="" />
                  Sign Up with Google
                </button>
              </div>
            </form>
          </div>

          <p className="login-bottom-p">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
