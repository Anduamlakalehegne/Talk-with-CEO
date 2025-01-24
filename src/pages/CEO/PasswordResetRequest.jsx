import { useState } from 'react';
import logo from '../../assets/logo.png';
import { FaEnvelope, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';  // Added Icons

const PasswordResetRequest = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
    
        try {
            const response = await fetch('http://localhost:5000/api/ceo/request-password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to request password reset');
            }
    
            const data = await response.json();
            setMessage(data.message);
        } catch (err) {
            setError(err.message || 'Failed to request password reset');
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h2><img src={logo} alt="logo" /></h2>
                <h2 className="form-title">Request Password Reset</h2>
                <form onSubmit={handleSubmit} className="form">
                    <div className="input-group">
                        <div className="input-icon">
                            <FaEnvelope size={20} />
                        </div>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                           <FaExclamationCircle className="error-icon" color='#f80202' size={15} />
                           <p className="error-text">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="success-message">
                            <FaCheckCircle className="success-icon" size={20} color='#0bb343' />
                            <p className="success-text">{message}</p>
                        </div>
                    )}

                    <div className="submit-btn-container">
                        <button type="submit" className="submit-btn">Request Reset Link</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordResetRequest;
