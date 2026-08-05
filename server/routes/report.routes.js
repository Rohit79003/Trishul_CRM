const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/report.controller');

router.get('/dashboard/summary', auth, ctrl.dashboardSummary);
router.get('/reports/analytics', auth, ctrl.getAnalytics);

module.exports = router;
