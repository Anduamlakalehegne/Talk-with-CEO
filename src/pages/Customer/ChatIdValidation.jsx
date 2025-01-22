import { useState } from 'react';
import { FaComments, FaExclamationCircle, FaSpinner } from 'react-icons/fa'; // Import back arrow icon
import axios from 'axios';
import './CustomerValidation.css';
import { Link, } from 'react-router-dom'; // Import Link and useHistory
import logo from '../../assets/logo.png';

export default function ChatIdValidation({ onChatValidated, onBack }) {
    const [chatId, setChatId] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e) => {
        setChatId(e.target.value);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!chatId) {
            setError('Please enter your chat ID.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Validate the chatId by making an API request
            const response = await axios.post('http://localhost:5000/api/chats/validate-chat-id', { chatId });

            if (response.data.isValid) {
                // If the chat ID is valid, pass it to the parent component and proceed to the Chat
                onChatValidated(chatId);
            } else {
                setError('Invalid chat ID. Please try again.');
            }
        } catch (error) {
            console.error(error);
          
            // Check if error.response exists, meaning the server responded with an error
            if (error.response && error.response.data) {
              const errorMessage = error.response.data.message;
                setError(errorMessage);
            } else {
              // Handle the case when no response is received (network error or server not responding)
              setError('There was an issue validating the OTP. Please try again later.');
            }
          } finally {
            setIsLoading(false);
          }
    };

    return (
        <div className="container">
            <div className="card">
                <h2><img src={logo} alt="logo" /></h2>
                <h2 className="title">Enter Your Chat ID</h2>
                <p className="description">Please enter your chat ID to proceed.</p>

                {/* Back Button */}
                {/* <button 
          className="back-button" 
          onClick={onBack}
          aria-label="Go back"
        >
          <FaArrowLeft /> Back
        </button> */}

                <form onSubmit={handleSubmit} className="form">
                    <div className="input-wrapper">
                        <FaComments className="input-icon" />
                        <input
                            type="text"
                            placeholder="Chat ID"
                            value={chatId}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className="input"
                            aria-label="Chat ID"
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
                        className={`buttonCustomerValidation ${isLoading ? 'button-disabledCV' : ''}`}
                    >
                        {isLoading ? (
                            <>
                                <FaSpinner style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} />
                                Validating Chat ID...
                            </>
                        ) : (
                            'Validate Chat ID'
                        )}
                    </button>
                </form>
                <div className="switch-to-chatid">
                    <p>
                        Dont have account ?{' '}
                        <Link
                            to="/"
                            onClick={onBack}
                            style={{ textDecoration: 'none', color: '#004360' }}
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
