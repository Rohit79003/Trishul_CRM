const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const ctrl = require('../controllers/employee.controller');

// My Team roster & workload metrics (Supervisor & Admin)
router.get('/my-team', auth, requireRole('admin', 'supervisor'), ctrl.getMyTeam);

// User list & employee management routes
router.get('/', auth, requireRole('admin', 'supervisor'), ctrl.list);
router.get('/:id', auth, requireRole('admin'), ctrl.getById);
router.post('/', auth, requireRole('admin'), ctrl.create);
router.put('/:id', auth, requireRole('admin'), ctrl.update);
router.delete('/:id', auth, requireRole('admin'), ctrl.remove);

module.exports = router;
