import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PasswordReset.css';  // Import the CSS file
import logo from '../../assets/logo.png';
import { FaLock, FaExclamationCircle, FaCheckCircle, FaEye, FaEyeSlash } from 'react-icons/fa';  // Import icons

const PasswordReset = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false); // Track visibility for new password
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Track visibility for confirm password
    const { token } = useParams(); // Get reset token from the URL
    const navigate = useNavigate(); // React Router navigation

    useEffect(() => {
        if (token) {
            setResetToken(token);
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
    
        // Validate password match
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:5000/api/ceo/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: resetToken, newPassword }),
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reset password');
            }
    
            const data = await response.json();
            setMessage(data.message);
    
            // Redirect to login page on success
            setTimeout(() => {
                navigate('/login'); // Redirect to login page
            }, 1000); // Delay for 1 second before redirecting
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        }
    };

    return (
        <div className="container">
            <div className="form-container">
                <h2><img src={logo} alt="logo" /></h2>
                <h2 className="form-title">Reset Password</h2>
                <form onSubmit={handleSubmit} className="form">
                    <div className="input-group">
                        <div className="input-icon">
                            <FaLock size={20} className="input-icon-style" />
                        </div>
                        <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className="input-field"
                        />
                        <div className="eye-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
                            {showNewPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </div>
                    </div>

                    <div className="input-group">
                        <div className="input-icon">
                            <FaLock size={20} className="input-icon-style" />
                        </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="input-field"
                        />
                        <div className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </div>
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
                        <button type="submit" className="submit-btn">
                            <FaLock className="submit-btn-icon" size={18} />
                            Reset Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordReset;
