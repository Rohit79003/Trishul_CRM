const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const ctrl = require('../controllers/customer.controller');

router.get('/', auth, ctrl.list);
router.get('/:id', auth, ctrl.getById);
router.post('/', auth, ctrl.create);
router.put('/:id', auth, ctrl.update);
router.delete('/:id', auth, requireRole('admin', 'supervisor'), ctrl.remove);

module.exports = router;
