const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const ctrl = require('../controllers/assistant.controller');

router.post('/', auth, requireRole('admin'), ctrl.chat);

module.exports = router;
