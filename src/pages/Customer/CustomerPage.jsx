import React, { useState, useEffect } from 'react';
import { CustomerValidation } from './CustomerValidation';
import { OtpVerification } from './OtpVerification';
import { Registration } from './RegistrationForm';
import Chat from './Chat';
import axios from 'axios';
import ChatIdValidation from './ChatIdValidation';

export default function CustomerPage() {
  // Use lazy initialization to load initial state from localStorage
  const [stage, setStage] = useState(() => {
    const savedStage = localStorage.getItem('stage');
    return savedStage ? Number(savedStage) : 1;  // Default to stage 1 if no value in localStorage
  });

  const [contactInfo, setContactInfo] = useState(() => {
    return localStorage.getItem('contactInfo') || ''; 
  });

  const [chatHistory, setChatHistory] = useState([]);
  const [chatId, setChatId] = useState(() => {
    return localStorage.getItem('chatId') || '';
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('stage', stage);
    localStorage.setItem('contactInfo', contactInfo);
    localStorage.setItem('chatId', chatId);
  }, [stage, contactInfo, chatId]);

  // Handle the validation stage, where chatId and contactInfo are received
  const handleValidate = async (contactInfo, chatId) => {
    setContactInfo(contactInfo);
    setChatId(chatId);
    setStage(2); // Proceed to OTP stage
  };

  const handleAccountExist = () => {
    setStage(5); // Switch to the ChatIdValidation stage
  };

  const assignChatId = (chatId) => {
    setChatId(chatId);
    setStage(4); // Proceed to Chat stage when chatId is valid
  };

  const handleOtpVerify = (otp) => {
    console.log('Verifying OTP:', otp);
    setStage(3); // Proceed to Registration stage
  };

  const handleRegister = async (name, username) => {
    console.log('Registering user:', name, username);

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', {
        contactInfo,
        name,
        username,
      });

      if (response.status === 200) {
        console.log('User registered successfully');
        setStage(4); // After registration, move to the chat stage
      } else {
        console.error('Registration failed:', response.data.error);
        alert('Registration failed, please try again later.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('There was an error during registration. Please try again later.');
    }
  };

  const handleSendMessage = (message) => {
    setChatHistory((prev) => [...prev, `You: ${message}`]);
    setChatHistory((prev) => [...prev, `CEO: Thank you for your message!`]);
  };

  const onEndChat = () => {
    // Reset stage to 1 (Customer Validation)
    setStage(1);
    setChatId('');
    setContactInfo('');
    setChatHistory([]);
    
    // Clear relevant data from localStorage
    localStorage.removeItem('chatId');
    localStorage.removeItem('contactInfo');
    localStorage.removeItem('stage');

    // Optionally, clear other data such as chat history
    localStorage.removeItem('chatHistory');
  };

  // Function to handle the back button from ChatIdValidation
  const handleBackToAccountExist = () => {
    setStage(1); // Go back to the previous step (Account Exist / Stage 5)
  };

  return (
    <div>
      {stage === 1 && <CustomerValidation onValidate={handleValidate} onAccountExist={handleAccountExist} />}
      {stage === 2 && <OtpVerification contactInfo={contactInfo} onVerify={handleOtpVerify} />}
      {stage === 3 && <Registration onRegister={handleRegister} />}
      {stage === 4 && <Chat onSendMessage={handleSendMessage} chatHistory={chatHistory} chatId={chatId} onEndChat={onEndChat} />}
      {stage === 5 && <ChatIdValidation onChatValidated={assignChatId} onBack={handleBackToAccountExist} />}
    </div>
  );
}
