import React, { useState, useEffect } from "react";
import Image from "../assets/image.png";
import Logo from "../assets/logo.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";
import { axiosInstance } from "../api";
import { toast } from "react-toastify";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isForget, setIsForget] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        toast.error("Please fill in all fields");
        return
      }
      const formData = { email, password };
      const response = await axiosInstance.post("/admin/login", formData);
      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem('admin_token', JSON.stringify(token));
        toast.success("Login successful", { duration: 2000 });
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        navigate("/dashboard");
      } else {
        toast.error(`Login failed with status ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      if (!email) {
        toast.error("Please provide your email");
        return
      }
      const response = await axiosInstance.post("/admin/forget-password", { email });
      if (response.status === 200) {
        setIsForget(false);
        setIsResetPassword(true);
        toast.success("OTP sent successfully", { duration: 2000 });
      } else {
        toast.error(`Failed to send OTP: ${response.statusText}`);
      }
    } catch (error) {
      if (error.response) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      if (!otp || !password || !confirmPassword) {
        toast.error("Please fill in all fields");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      const response = await axiosInstance.post("/admin/reset-password", { email, otp, password });
      if (response.status === 200) {
        toast.success("Password reset successful", { duration: 2000 });
        setIsForget(false);
        setIsResetPassword(false);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setOtp("");
        navigate("/login");
      } else {
        toast.error(`Password reset failed: ${response.data.message}`);
      }
    } catch (error) {
      if (error.response) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
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
          {(!isForget && !isResetPassword) && (
            <div className="login-center">
              <h2>Welcome back!</h2>
              <p>Please enter your details</p>
              <form onSubmit={handleLoginSubmit}>
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="pass-input-div">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  {showPassword ? (
                    <FaEyeSlash onClick={() => setShowPassword(!showPassword)} />
                  ) : (
                    <FaEye onClick={() => setShowPassword(!showPassword)} />
                  )}
                </div>
                <div className="login-center-options">
                  <button type="button" onClick={() => setIsForget(true)}>
                    Forgot password?
                  </button>
                </div>
                <div className="login-center-buttons">
                  <button type="submit">Log In</button>
                </div>
              </form>
            </div>
          )}
          {isForget && (
            <div className="login-center">
              <p>Forget Password</p>
              <form onSubmit={handleSendOTP}>
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="login-center-buttons">
                  <button type="submit">Send OTP</button>
                </div>
              </form>
            </div>
          )}
          {isResetPassword && (
            <div className="login-center">
              <p>Reset Password</p>
              <form onSubmit={handleResetPassword}>
                <input
                  type="number"
                  placeholder="OTP"
                  name="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)} />
                <div className="pass-input-div">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                  />
                  {showPassword ? (
                    <FaEyeSlash onClick={() => setShowPassword(!showPassword)} />
                  ) : (
                    <FaEye onClick={() => setShowPassword(!showPassword)} />
                  )}
                </div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                />
                <div className="login-center-buttons">
                  <button type="submit">Reset Password</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
