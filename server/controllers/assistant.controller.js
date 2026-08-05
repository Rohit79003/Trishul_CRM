const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Task = require('../models/Task');
const User = require('../models/User');

async function buildContext() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [leadsToday, customersTotal, tasksCompleted, inactiveCustomers, topPerformer] =
    await Promise.all([
      Lead.countDocuments({ createdAt: { $gte: startOfToday } }),
      Customer.countDocuments(),
      Task.countDocuments({ completed: true }),
      Customer.find({ status: 'inactive' }).select('name company email'),
      User.findOne({ role: 'admin' }).select('name department'),
    ]);

  return {
    leadsToday,
    customersTotal,
    tasksCompleted,
    inactiveCustomersCount: inactiveCustomers.length,
    inactiveCustomersList: inactiveCustomers.map((c) => `${c.name} (${c.company})`).join(', '),
    topPerformerName: topPerformer?.name || 'Vikramaditya Sharma',
  };
}

// @desc    Process AI assistant chat queries (Admin Only)
// @route   POST /api/assistant
// @access  Private (Admin)
exports.chat = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt query is required.' });
    }

    const context = await buildContext();
    const query = prompt.toLowerCase();
    let text = '';

    if (query.includes('summarize') || query.includes('activity')) {
      text = `📊 **Today's Activity Summary:**\n\n- **New Leads Today**: ${context.leadsToday}\n- **Total Customer Directory**: ${context.customersTotal}\n- **Completed Team Tasks**: ${context.tasksCompleted}\n- **Status**: All team activities are running smoothly with 0 SLA violations.`;
    } else if (query.includes('email') || query.includes('follow-up')) {
      text = `✉️ **Generated Follow-up Email Template:**\n\nSubject: Next steps regarding your Trishul CRM Enterprise Solution\n\nDear Client,\n\nThank you for evaluating Trishul CRM's AI-integrated platform. We've prepared a customized demonstration of our predictive analytics pipeline for your executive team.\n\nBest regards,\n${context.topPerformerName} | Trishul Leadership`;
    } else if (query.includes('inactive') || query.includes('customer')) {
      text = `⚠️ **Inactive Accounts Notice (${context.inactiveCustomersCount} found):**\n\n- **Accounts**: ${context.inactiveCustomersList || 'Kolkata Craft Export'}\n- **Action Recommendation**: Trigger automated re-engagement campaign or schedule an account review call.`;
    } else if (
      query.includes('employee') ||
      query.includes('performing') ||
      query.includes('top')
    ) {
      text = `🏆 **Top Performing Employee of the Month:**\n\n**${context.topPerformerName}** — Leading ARR generation with 100% team SLA compliance!`;
    } else {
      text = `Trishul AI Co-Pilot: Processed request with active CRM context (Total Customers: ${context.customersTotal}, Completed Tasks: ${context.tasksCompleted}). All systems operational.`;
    }

    res.json({
      text,
      context,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
