import { useState } from 'react';
import logo from '../../assets/logo.png';
import './PasswordReset.css';  // Import the CSS file
import { useNavigate } from 'react-router-dom';
import { FaLock, FaExclamationCircle, FaEye, FaEyeSlash, FaEnvelope } from 'react-icons/fa';
import { MdLogin } from "react-icons/md";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    try {
      const response = await fetch('http://localhost:5000/api/ceo/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid credentials');
      }
  
      const data = await response.json();
      localStorage.setItem('token', data.token); // Store token in localStorage
      navigate('/ceo'); // Redirect to CEO dashboard after successful login
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = async (e) => {
    navigate('/request-password-reset');
  }

  return (
    <div className="container">
      <div className="form-container">
        <h2><img src={logo} alt="logo" /></h2>
        <h2 className="form-title">
          Sign in to CEO Dashboard
        </h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            {/* Email Input with Icon */}
            <div className="input-icon">
              <FaEnvelope size={20} />
            </div>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input-field"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Input with Icon */}
          <div className="input-group">
            <div className="input-icon">
              <FaLock size={20} />
            </div>
            <input
              id="password"
              name="password"
              type={showNewPassword ? 'text' : 'password'}  // Toggle password visibility
              autoComplete="current-password"
              required
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="eye-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
              {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </div>
          </div>


          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="checkbox-label">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="checkbox-input"
              />
              <label htmlFor="remember-me" className="remember-me-label">
                Remember me
              </label>
            </div>
            <div className="forgot-password">
              <a onClick={handleNavigate}>Forgot your password?</a>
            </div>
          </div>

          {error && (
            <div className="error-container">
              <div className="error-message">
                <FaExclamationCircle className="error-icon" color='#f80202' />
                <div className="error-text">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="submit-btn-container">
            <button
              type="submit"
              className="submit-btn2"
              disabled={isLoading}
            >
              <span className="icon-container">

              </span>
              {isLoading ? 'Signing in...' : 'Sign in'}
              <MdLogin className="lock-icon" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
