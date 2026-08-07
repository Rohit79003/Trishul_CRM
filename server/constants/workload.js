const WORKLOAD_THRESHOLDS = {
  AVAILABLE_MAX: 10, // activeLeads + openTasks < 10 => Available 🟢
  BUSY_MAX: 25,      // 10 <= activeLeads + openTasks <= 25 => Busy 🟡
                     // > 25 => Overloaded 🔴
};

const SCOPE_ENUM = {
  TEAM: 'team',
  MINE: 'mine',
  ALL: 'all',
};

module.exports = {
  WORKLOAD_THRESHOLDS,
  SCOPE_ENUM,
};
