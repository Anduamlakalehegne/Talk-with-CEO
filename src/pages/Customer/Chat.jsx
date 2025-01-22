import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaUserTie, FaPaperPlane, FaTimes } from 'react-icons/fa';
import './Chat.css'; // Import the CSS file
import io from 'socket.io-client'; // Import socket.io-client for WebSocket communication

export default function Chat({ initialMessages = [], onEndChat, chatId }) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const shouldScrollRef = useRef(true);
  const socketRef = useRef(null); // Ref for socket.io connection

  useEffect(() => {
    if (chatId) {
      fetchChatHistory();
    }
  }, [chatId]);

  useEffect(() => {
    if (shouldScrollRef.current) {
      scrollToBottom();
    }
  }, [chatHistory]);

  useEffect(() => {
    // Connect to WebSocket server when chatId is present
    if (chatId) {
      socketRef.current = io('http://localhost:5000'); // Replace with your backend URL

      socketRef.current.on('newMessage', (messageData) => {
        setChatHistory((prevHistory) => [...prevHistory, messageData]);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [chatId]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/chats/get-chat-history/${chatId}`);
      const data = await response.json();
      if (response.ok) {
        setChatHistory(data.messages);
      } else {
        console.error('Error fetching chat history:', data.error);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = {
        text: message,
        sender: 'user',
        timestamp: new Date(),
        chatId: chatId, // Ensure chatId is included
      };

      shouldScrollRef.current = true;
      setChatHistory((prevHistory) => [...prevHistory, newMessage]);
      setMessage('');

      try {
        await sendMessageToBackend(newMessage); // Send message to backend
        socketRef.current.emit('sendMessage', newMessage); // Emit the message to WebSocket server
        simulateCEOTyping(); // Simulate CEO response after a delay
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const sendMessageToBackend = async (message) => {
    try {
      const response = await fetch('http://localhost:5000/api/chats/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          text: message.text,
          sender: 'user',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error('Error sending message:', data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop === clientHeight;
      shouldScrollRef.current = isAtBottom;
    }
  };

  const simulateCEOTyping = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const ceoResponse = {
        text: "Thank you for your message. I'll get back to you shortly.",
        sender: 'ceo',
        timestamp: new Date(),
      };
      shouldScrollRef.current = true;
      setChatHistory((prevHistory) => [...prevHistory, ceoResponse]);
    }, 2000);
  };

  return (
    <div>
      <div className="chat-container">
        <div className="chat-header">
          <div style={{ display: 'flex' }}>
            <FaUserTie className="icon" aria-hidden="true" />
            <h2 className="header-title">Chat with CEO</h2> <br />
          </div>
          <p className="chat-id">Chat ID: {chatId}</p>
        </div>

        <div
          className="chat-messages"
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          {chatHistory.length === 0 ? (
            <p className="no-messages">No messages yet. Start the conversation!</p>
          ) : (
            chatHistory.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.sender === 'user' ? (
                  <FaUser className="icon" aria-hidden="true" />
                ) : (
                  <FaUserTie className="icon" aria-hidden="true" />
                )}
                <div className="message-content">
                  <p>{msg.text}</p>
                  <span className="timestamp">{formatTimestamp(new Date(msg.timestamp))}</span>
                </div>
              </div>
            ))
          )}

          {isTyping && (
            <div className="message ceo">
              <FaUserTie className="icon" aria-hidden="true" />
              <div className="message-content">
                <p>CEO is typing...</p> 
              </div>
            </div>
          )}
        </div>

        <form className="chat-input-form" onSubmit={handleSend}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            aria-label="Type your message"
          />
          <button
            type="submit"
            className={`button ${message.trim() === '' ? 'disabled-button' : ''}`}
            disabled={!message.trim()}
            aria-label="Send message"
          >
            <FaPaperPlane aria-hidden="true" />
          </button>
        </form>

        {/* Add the "End Chat" button */}
        <div className='parent-container'>
          <button
            className="end-chat-button"
            onClick={onEndChat}
          >
            <FaTimes aria-hidden="true" /> End Chat
          </button>
        </div>
      </div>
    </div>
  );
}
