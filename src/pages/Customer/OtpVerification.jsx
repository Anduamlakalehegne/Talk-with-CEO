import { useState } from 'react';
import { FaLock, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import './OtpVerification.css'; // Import the CSS file

export function OtpVerification({contactInfo, onVerify }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setOtp(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }

    // if (!/^\d{6}$/.test(otp)) {
    //   setError('Please enter a valid 6-digit OTP.');
    //   return;
    // }

    setIsLoading(true);

    try {
      // Make the API request to verify OTP
      const response = await fetch('http://localhost:5000/api/users/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp, contactInfo }),
      });

      const data = await response.json();

      if (response.ok) {
        // If OTP is valid, proceed with the onVerify action
        onVerify(data);
      } else {
        setError(data.error || 'Invalid OTP or OTP expired.');
      }
    } catch (error) {
      setError('There was an issue verifying the OTP. Please try again later.' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Enter OTP</h2>
        <p className="description">An OTP has been sent to your contact. Please enter it below.</p>

        <form onSubmit={handleSubmit} className="form">
          <div className="input-wrapper">
            <FaLock className="input-icon" />
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={handleInputChange}
              disabled={isLoading}
              className="input"
              aria-label="Enter 6-digit OTP"
              maxLength={6}
            />
          </div>
          {error && (
            <p className="error">
              <FaExclamationCircle />
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`buttonOtpVerification ${isLoading ? 'button-disabled' : ''}`}
            onMouseEnter={(e) => {
              if (!isLoading) e.target.classList.add('button-hover');
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.target.classList.remove('button-hover');
            }}
          >
            {isLoading ? (
              <>
                <FaSpinner style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                Verifying OTP...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}