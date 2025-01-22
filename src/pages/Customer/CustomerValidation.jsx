import { useState } from 'react';
import { FaEnvelope, FaPhone, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import { Link, } from 'react-router-dom'; // Import Link and useHistory
import axios from 'axios';
import './CustomerValidation.css';
import logo from '../../assets/logo.png';

export function CustomerValidation({ onValidate, onAccountExist }) {
  const [contactInfo, setContactInfo] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const phonePattern = /^[0-9]{10}$/;

  const handleInputChange = (e) => {
    setContactInfo(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!contactInfo) {
      setError('Please enter your email or phone number.');
      return;
    }

    if (!emailPattern.test(contactInfo) && !phonePattern.test(contactInfo)) {
      setError('Please enter a valid email address or phone number.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/users/send-otp', { contactInfo });
      console.log(response);
    
      if (response.status === 200) {
        // Pass contactInfo and chatId to the next step (onValidate)
        onValidate(contactInfo, response.data.chatId);
      } else {
        setError('There was an issue sending the OTP. Please try again later.');
      }
    } catch (error) {
      console.error(error);
    
      // Check if error.response exists, meaning the server responded with an error
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.error;
          setError(errorMessage);
      } else {
        // Handle the case when no response is received (network error or server not responding)
        setError('There was an issue sending the OTP. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
    
  };

  return (
    <div className="container">
      <div className="card">
      <h2><img src={logo} alt="logo"/></h2>
        <h2 className="titlecv">Validate Your Identity</h2>
        <p className="descriptioncv">Please enter your email or phone number to proceed.</p>

        <form onSubmit={handleSubmit} className="form"> 
          <div className="input-wrapper"> 
            {emailPattern.test(contactInfo) ? (
              <FaEnvelope className="inputcv-icon" />
            ) : (
              <FaPhone className="inputcv-icon" />
            )}
            <input
              type="text"
              placeholder="Email or Phone Number"
              value={contactInfo}
              onChange={handleInputChange}
              disabled={isLoading}
              className="input"
              aria-label="Email or Phone Number"
            />
          </div>
          {error && (
            <p className="errorcv">
              <FaExclamationCircle />
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className={`buttonCustomerValidation ${isLoading ? 'button-disabledCV' : ''}`}
            onMouseEnter={(e) => {
              if (!isLoading) e.target.classList.add('buttonCustomerValidation-hover');
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.target.classList.remove('buttonCustomerValidation-hover');
            }}
          >
            {isLoading ? (
              <>
                <FaSpinner style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                Sending OTP...
              </>
            ) : (
              'Send OTP'
            )}
          </button>
        </form>

        <div className="switch-to-chatid">
          <p>
            Already have an account?{' '}
            <Link
              to="/"
              onClick={() => onAccountExist(true)}
              style={{textDecoration:'none', color:'#004360'}}
            >
               Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}