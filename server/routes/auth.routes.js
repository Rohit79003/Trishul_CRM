const router = require('express').Router();
const { register, login, logout, me, changePassword } = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, me);
router.post('/change-password', auth, changePassword);

module.exports = router;
