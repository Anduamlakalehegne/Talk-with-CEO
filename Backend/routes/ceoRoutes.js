const express = require('express');
const { registerCeo, loginCeo, requestPasswordReset, resetPassword } = require('../controllers/ceoController');

const router = express.Router();

// Route to register CEO
router.post('/register', registerCeo);

// Route to login CEO
router.post('/login', loginCeo);

// Route to request password reset
router.post('/request-password-reset', requestPasswordReset);

// Route to reset password
router.post('/reset-password', resetPassword);

module.exports = router;
