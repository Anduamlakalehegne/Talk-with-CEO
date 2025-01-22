import React, { useState } from 'react';
import { FaUser, FaUserTag, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import './Registration.css'; // Import the CSS file

export function Registration({ contactInfo, onRegister }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (e) => {
    setName(e.target.value);
    setError('');
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !username) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      // Call the backend to register the user
      await onRegister(name, username);  // This calls handleRegister in CustomerPage
    } catch (error) {
      setError('There was an issue with registration. Please try again later.' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Complete Your Registration</h2>
        <p className="description">Please enter your name and preferred username to finish registration.</p>

        <form onSubmit={handleSubmit} className="form">
          <div className="input-wrapper">
            <FaUser className="input-icon" />
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={handleNameChange}
              disabled={isLoading}
              className="input"
              aria-label="Your Name"
            />
          </div>
          <div className="input-wrapper">
            <FaUserTag className="input-icon" />
            <input
              type="text"
              placeholder="Preferred Username"
              value={username}
              onChange={handleUsernameChange}
              disabled={isLoading}
              className="input"
              aria-label="Preferred Username"
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
            className={`button-register ${isLoading ? 'button-disabled' : ''}`}
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
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}