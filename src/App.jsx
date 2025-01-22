
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import CEODashboard from './pages/CEO/CEODashboard';
import CustomerPage from './pages/Customer/CustomerPage';
import LoginPage from './pages/CEO/LoginPage';
import Register from './pages/CEO/Register';
// import Login from './pages/CEO/Login';
import PasswordResetRequest from './pages/CEO/PasswordResetRequest';
import PasswordReset from './pages/CEO/PasswordReset';
// import Dashboard from './pages/CEO/Dashboard';



function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<CustomerPage />} />
          <Route path="/ceo" element={<CEODashboard />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<Register />} />
          <Route path="/request-password-reset" element={<PasswordResetRequest />} />
          <Route path="/reset-password/:token" element={<PasswordReset />} />
          {/* <Route path="/" element={<Portfolio />} /> */}
        </Routes>
    </BrowserRouter>
  );
}

export default App;
