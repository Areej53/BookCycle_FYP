import React, { useEffect, useState } from "react";
import Image from "../assets/image.png";
import Logo from "../assets/logo.png";
import { FaEye, FaEyeSlash, FaUpload, FaCheckCircle } from "react-icons/fa";
import "../styles/Register.css";
import { Link, useNavigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../api/client";
import { getStoredAuthToken } from "../utils/authStorage";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [token, setToken] = useState(getStoredAuthToken);
  const [inlineError, setInlineError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [signupRole, setSignupRole] = useState("customer");
  const [interests, setInterests] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Rider specific state
  const [fullName, setFullName] = useState("");
  const [riderEmail, setRiderEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [riderPassword, setRiderPassword] = useState("");
  const [riderConfirmPassword, setRiderConfirmPassword] = useState("");
  const [cnic, setCnic] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [vehicleType, setVehicleType] = useState("Bike");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [drivingLicenseImage, setDrivingLicenseImage] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleInterestChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setInterests([...interests, value]);
    } else {
      setInterests(interests.filter((i) => i !== value));
    }
  };

  const handleFileUpload = (e, setFileState) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setInlineError("File size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFileState(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    setInlineError("");
    let name = e.target.name.value.trim();
    let lastname = e.target.lastname.value.trim();
    let email = e.target.email.value.trim();
    let password = e.target.password.value;
    let confirmPassword = e.target.confirmPassword.value;

    if (name.length === 0 || lastname.length === 0 || email.length === 0 || password.length === 0 || confirmPassword.length === 0) {
      setInlineError("Please fill all required fields");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|pk|org|net|edu|gov)$/i;
    const isBadGmail = /@gmai\.com|@gmial\.com|@gamil\.com/i.test(email);

    if (!emailRegex.test(email) || isBadGmail) {
      setInlineError("Please enter a valid email address");
      return;
    }

    if (interests.length === 0) {
      setInlineError("Please select at least one interest");
      return;
    }

    if (password !== confirmPassword) {
      setInlineError("Passwords don't match");
      return;
    }

    const formData = {
      name: `${name} ${lastname}`.trim(),
      email,
      password,
      role: "customer",
      interests
    };
    setIsLoading(true);
    try {
      await api.post("/register", formData);
      navigate("/login");
    } catch (err) {
      setInlineError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRiderSubmit = async (e) => {
    e.preventDefault();
    setInlineError("");

    if (!fullName.trim() || !riderEmail.trim() || !phone.trim() || !riderPassword || !riderConfirmPassword || !cnic.trim() || !address.trim() || !city.trim() || !vehicleNumber.trim() || !drivingLicenseNumber.trim()) {
      setInlineError("Please fill all required fields.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|pk|org|net|edu|gov)$/i;
    const isBadGmail = /@gmai\.com|@gmial\.com|@gamil\.com/i.test(riderEmail.trim());

    if (!emailRegex.test(riderEmail.trim()) || isBadGmail) {
      setInlineError("Please enter a valid email address.");
      return;
    }

    if (riderPassword !== riderConfirmPassword) {
      setInlineError("Passwords don't match.");
      return;
    }

    if (!profileImage) {
      setInlineError("Profile image is required.");
      return;
    }

    if (!drivingLicenseImage) {
      setInlineError("Driving license image is required.");
      return;
    }

    if (!confirmed) {
      setInlineError("Please confirm that the information provided is correct.");
      return;
    }

    // Islamabad-only validation for riders
    if (city && !city.toLowerCase().includes('islamabad')) {
      setInlineError("Sorry, we currently only serve riders in Islamabad.");
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      email: riderEmail.trim(),
      phone: phone.trim(),
      password: riderPassword,
      cnic: cnic.trim(),
      address: address.trim(),
      city: city.trim(),
      vehicleType,
      vehicleNumber: vehicleNumber.trim(),
      drivingLicenseNumber: drivingLicenseNumber.trim(),
      profileImage,
      drivingLicenseImage,
      confirmation: confirmed
    };

    setIsLoading(true);
    try {
      await api.post("/rider-requests/register", payload);
      setIsSubmitted(true);
    } catch (err) {
      setInlineError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token !== "") {
      navigate("/home");
    }
  }, []);

  return (
    <div className="register-main">
      <div className="register-left">
        <img src={Image} alt="BookCycle illustration" />
      </div>
      <div className="register-right">
        <div className="register-right-container">
          <div className="register-logo">
            <img src={Logo} alt="BookCycle Logo" />
          </div>

          <div className="register-center">
            <h2>Welcome to our website!</h2>
            <p>Please enter your details</p>

            {isSubmitted ? (
              <div style={{
                backgroundColor: '#F4F7F4',
                padding: '30px 20px',
                borderRadius: '12px',
                border: '1px solid #13493C',
                textAlign: 'center',
                margin: '20px 0'
              }}>
                <FaCheckCircle size={48} color="#13493C" style={{ marginBottom: '16px' }} />
                <h3 style={{ color: '#13493C', marginBottom: '12px', fontSize: '1.3rem' }}>
                  Application Submitted!
                </h3>
                <p style={{ color: '#2C4C3E', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '24px' }}>
                  Your Rider application has been submitted successfully.
                  <br /><br />
                  Your application is currently under review. You will receive an email when the Admin makes a decision.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  style={{
                    backgroundColor: '#DDA15E',
                    color: '#13493C',
                    padding: '12px 30px',
                    border: 'none',
                    borderRadius: '25px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <>
                {/* Role selection option */}
                <div className="role-selection">
                  <p>Sign Up As</p>
                  <div className="role-options">
                    <label>
                      <input
                        type="radio"
                        name="signupRole"
                        value="customer"
                        checked={signupRole === "customer"}
                        onChange={() => { setSignupRole("customer"); setInlineError(""); }}
                      />
                      Customer
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="signupRole"
                        value="rider"
                        checked={signupRole === "rider"}
                        onChange={() => { setSignupRole("rider"); setInlineError(""); }}
                      />
                      Rider
                    </label>
                  </div>
                </div>

                {inlineError && (
                  <div style={{
                    color: '#d32f2f',
                    background: '#ffebee',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '15px',
                    fontSize: '14px',
                    textAlign: 'center',
                    border: '1px solid #ffcdd2'
                  }}>
                    {inlineError}
                  </div>
                )}

                {signupRole === "customer" ? (
                  /* Customer Signup Form */
                  <form onSubmit={handleCustomerSubmit}>
                    <input type="text" placeholder="Name" name="name" />
                    <input type="text" placeholder="Lastname" name="lastname" />
                    <input type="email" placeholder="Email" name="email" />
                    <div className="pass-input-div">
                      <input type={showPassword ? "text" : "password"} placeholder="Password" name="password" />
                      {showPassword ? <FaEyeSlash onClick={() => setShowPassword(!showPassword)} /> : <FaEye onClick={() => setShowPassword(!showPassword)} />}
                    </div>
                    <div className="pass-input-div">
                      <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" name="confirmPassword" />
                      {showPassword ? <FaEyeSlash onClick={() => setShowPassword(!showPassword)} /> : <FaEye onClick={() => setShowPassword(!showPassword)} />}
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
                      <button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Sign Up"}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Rider Application Form */
                  <form onSubmit={handleRiderSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#13493C' }}>Full Name *</label>
                      <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#13493C' }}>Email *</label>
                      <input type="email" placeholder="Email Address" value={riderEmail} onChange={(e) => setRiderEmail(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#13493C' }}>Phone *</label>
                      <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#13493C' }}>Password *</label>
                      <div className="pass-input-div">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" value={riderPassword} onChange={(e) => setRiderPassword(e.target.value)} />
                        {showPassword ? <FaEyeSlash onClick={() => setShowPassword(!showPassword)} /> : <FaEye onClick={() => setShowPassword(!showPassword)} />}
                      </div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#13493C' }}>Confirm Password *</label>
                      <div className="pass-input-div">
                        <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" value={riderConfirmPassword} onChange={(e) => setRiderConfirmPassword(e.target.value)} />
                        {showPassword ? <FaEyeSlash onClick={() => setShowPassword(!showPassword)} /> : <FaEye onClick={() => setShowPassword(!showPassword)} />}
                      </div>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#13493C' }}>CNIC *</label>
                      <input type="text" placeholder="CNIC (e.g. 35202-xxxxxxx-x)" value={cnic} onChange={(e) => setCnic(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#13493C' }}>Address *</label>
                      <input type="text" placeholder="Complete Residential Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#13493C' }}>City *</label>
                      <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#13493C', display: 'block', marginBottom: '6px' }}>Vehicle Type *</label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '14px',
                          backgroundColor: 'var(--color-input-bg)',
                          border: 'none',
                          borderBottom: '1px solid var(--color-border)',
                          outline: 'none',
                          fontSize: '14px',
                          color: '#13493C'
                        }}
                      >
                        <option value="Bike">Motorbike / Motorcycle</option>
                        <option value="Scooter">Scooter</option>
                        <option value="Car">Car / Van</option>
                        <option value="Bicycle">Bicycle</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#13493C' }}>Vehicle Number *</label>
                      <input type="text" placeholder="Vehicle Registration Number (e.g. LEB-1234)" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#13493C' }}>Driving License Number *</label>
                      <input type="text" placeholder="Driving License Number" value={drivingLicenseNumber} onChange={(e) => setDrivingLicenseNumber(e.target.value)} />
                    </div>

                    {/* Profile Image Upload */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#13493C', display: 'block', marginBottom: '6px' }}>Profile Image *</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label style={{
                          padding: '10px 16px',
                          backgroundColor: '#EBE9D8',
                          color: '#13493C',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <FaUpload /> Choose Image
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, setProfileImage)} />
                        </label>
                        {profileImage && (
                          <img src={profileImage} alt="Profile preview" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        )}
                      </div>
                    </div>

                    {/* Driving License Image Upload */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: '#13493C', display: 'block', marginBottom: '6px' }}>Driving License Image *</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label style={{
                          padding: '10px 16px',
                          backgroundColor: '#EBE9D8',
                          color: '#13493C',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <FaUpload /> Upload License Document
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, setDrivingLicenseImage)} />
                        </label>
                        {drivingLicenseImage && (
                          <img src={drivingLicenseImage} alt="License preview" style={{ width: '60px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #CCC' }} />
                        )}
                      </div>
                    </div>

                    {/* Confirmation Checkbox */}
                    <div style={{ margin: '20px 0', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <input
                        type="checkbox"
                        id="confirm-rider-info"
                        checked={confirmed}
                        onChange={(e) => setConfirmed(e.target.checked)}
                        style={{ marginTop: '3px', width: 'auto' }}
                      />
                      <label htmlFor="confirm-rider-info" style={{ fontSize: '13px', color: '#13493C', lineHeight: '1.4', cursor: 'pointer' }}>
                        I confirm that the information provided is correct and belongs to me.
                      </label>
                    </div>

                    {/* Action buttons */}
                    <div className="register-center-buttons" style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button type="submit" disabled={isLoading}>
                        {isLoading ? "Submitting Application..." : "Submit Application"}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/login")}
                        style={{
                          width: '100%',
                          padding: '14px',
                          border: '2px solid #13493C',
                          borderRadius: '30px',
                          fontSize: '16px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          backgroundColor: '#FAF9F0',
                          color: '#13493C',
                          transition: 'all 0.25s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#13493C';
                          e.currentTarget.style.color = '#FAF9F0';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#FAF9F0';
                          e.currentTarget.style.color = '#13493C';
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>

          {!isSubmitted && (
            <p className="register-bottom-p">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
