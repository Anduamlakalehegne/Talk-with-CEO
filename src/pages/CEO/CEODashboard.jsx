import { useState, useEffect, useRef } from 'react';
import { MdLogout } from "react-icons/md";
import { BsFillSendFill } from "react-icons/bs";
import { RiWechatPayFill } from "react-icons/ri"; 
import { FaClock } from "react-icons/fa6";
import './CEODashboard.css';
import logo from '../../assets/logo.png';
import axios from 'axios';
import { FaUser, FaUserTie, FaComments } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; // Add useNavigate for navigation

const CEODashboard = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState('New');
  const [activeSection, setActiveSection] = useState('Chats');
  const [chats, setChats] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef(null);
  const shouldScrollRef = useRef(true);
  const navigate = useNavigate();

  // Check if the user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login page if no token is found
      navigate('/login');
    }
  }, [navigate]);

  // Fetch all chats when the component mounts
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/chats/get-all-chats');
        setChats(response.data.chats);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (shouldScrollRef.current && selectedChat) {
      scrollToBottom();
    }
  }, [selectedChat, chatHistory]);

  useEffect(() => {
    if (selectedChat) {
      // Fetch chat history when a chat is selected
      const fetchChatHistory = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/chats/get-chat-history/${selectedChat.chatId}`);
          setChatHistory(response.data.messages);
        } catch (error) {
          console.error('Error fetching chat history:', error);
        }
      };
      fetchChatHistory();
    }
  }, [selectedChat]);

  const handleChatClick = (chat) => {
    setSelectedChat(chat);
  };

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };


  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        // Send message as CEO
        await axios.post('http://localhost:5000/api/chats/send-message', {
          chatId: selectedChat.chatId,
          text: message,
          sender: 'ceo',
        });

        // Update chat history to reflect CEO's message
        setChatHistory(prevHistory => [
          ...prevHistory,
          { sender: 'ceo', text: message, timestamp: new Date() }
        ]);

        // Clear input field after sending message
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
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

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');  // Remove token from localStorage
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>CEO Dashboard</h2>
        <ul>
          <li
            className={activeSection === 'Chats' ? 'active' : ''}
            onClick={() => handleSectionClick('Chats')}
          >
            <FaComments size={22} /> Chats
          </li>
          <li
            className={activeSection === 'Profile' ? 'active' : ''}
            onClick={() => handleSectionClick('Profile')}
          >
            <FaUserTie size={22} /> Profile

          </li>

        </ul>
        <button className="logout-btn" onClick={handleLogout}>
          <MdLogout size={23} /> Logout
        </button>
      </aside>

      <main className="content">
        <header className="chat-overview">
          <h2>Chat Overview <img src={logo} alt="logo" /></h2>
          <div className="stats">
            <div className="stat">
              <div className="stat-content">
                Total Chats
                <FaComments size={25} />
              </div>
              <span className="stat-number">{chats.length}</span>
            </div>
            <div className="stat">
              <div className="stat-content">
                New Chats
                <RiWechatPayFill size={25} />
              </div>
              <span className="stat-number">
                {chats.filter(chat => chat.status === 'new').length}
              </span>
            </div>
            <div className="stat">
              <div className="stat-content">
                Pending Chats
                <FaClock size={25} />
              </div>
              <span className="stat-number">
                {chats.filter(chat => chat.status === 'pending').length}
              </span>
            </div>
          </div>
        </header>

        {activeSection === 'Chats' && (
          <section className="chats">
            <div className="chats-list">
              <p className='chatsHeader'>Chats</p>
              <div className="tabs">
                <button
                  className={activeTab === 'New' ? 'active' : ''}
                  onClick={() => handleTabClick('New')}
                >
                  New
                </button>
                <button
                  className={activeTab === 'Pending' ? 'active' : ''}
                  onClick={() => handleTabClick('Pending')}
                >
                  Pending
                </button>
              </div>
              {chats
                .filter((chat) => chat.status === activeTab.toLowerCase())
                .filter((chat) => chat.messages && chat.messages.length > 0)
                .map((chat) => (
                  <div key={chat.chatId} className="chat-item" onClick={() => handleChatClick(chat)}>
                    <div className="avatar" style={{width:"45px"}}>
                      {chat.name[0]}
                    </div>
                    <div className="chat-info">
                      <p className="chat-name">{chat.name}</p>
                      <p className="chat-message">
                        {chat.messages[chat.messages.length - 1]?.sender === 'user'
                          ? `Customer: ${chat.messages[chat.messages.length - 1]?.text.slice(0, 55)}.....`
                          : `CEO: ${chat.messages[chat.messages.length - 1]?.text.slice(0, 55)}.....`}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="chat-window" onScroll={handleScroll} ref={chatContainerRef}>
              {selectedChat ? (
                <>
                  <h3>Uaername : {selectedChat.username}</h3>
                  <p className='status'>Status: {selectedChat.status}</p>
                  <div className="chat-history">
                    {
                      chatHistory.map((msg, index) => (
                        <div key={index} className={`messageceo ${msg.sender}`}>
                          {msg.sender === 'ceo' ? (
                            <FaUserTie className="icon" aria-hidden="true" />
                          ) : (
                            <FaUser className="icon" aria-hidden="true" />
                          )}
                          <div className="messageceo-content">
                            <p>{msg.text}</p>
                            <span className="timestamp">{formatTimestamp(new Date(msg.timestamp))}</span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your reply..."
                  />
                  <button onClick={handleSendMessage}>
                    Send <BsFillSendFill size={15} style={{ marginLeft: '5px' }} />
                  </button>
                </>
              ) : (
                <h3>Select a chat</h3>
              )}
            </div>
          </section>
        )}

        {activeSection === 'Profile' && (
          <div className="profile-container">
            <h2 className="profile-title">CEO Profile</h2>
            <p className="profile-subtitle">Manage your personal information</p>
            <div className="profile-card">
              <div className="profile-left">
                <div className="profile-avatar"></div>
                <div>
                  <h3 className="profile-name">Jane Doe</h3>
                  <p className="profile-email">jane.doe@example.com</p>
                </div>
              </div>
              <div className="profile-info">
                <p className="profile-label">User Role</p>
                <p className="profile-value">CEO</p>
                <p className="profile-label">Phone</p>
                <p className="profile-value">+(251) 11121314</p>
                <p className="profile-label">Bio</p>
                <p className="profile-value">
                  Experienced CEO with a passion for innovation and team leadership.
                </p>
                <div className="profile-buttons">
                  <button className="edit-button">Edit Profile</button>
                  <button className="change-password-button">
                    <i className="lock-icon"></i> Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CEODashboard;
