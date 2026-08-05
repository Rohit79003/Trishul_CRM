const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const ctrl = require('../controllers/employee.controller');

// All employee routes are restricted to Admin role
router.get('/', auth, requireRole('admin'), ctrl.list);
router.get('/:id', auth, requireRole('admin'), ctrl.getById);
router.post('/', auth, requireRole('admin'), ctrl.create);
router.put('/:id', auth, requireRole('admin'), ctrl.update);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
