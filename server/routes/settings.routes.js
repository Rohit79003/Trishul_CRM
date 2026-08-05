const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/settings.controller');

router.get('/', auth, ctrl.getSettings);
router.put('/', auth, ctrl.updateSettings);
router.put('/password', auth, ctrl.changePassword);

module.exports = router;
