require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dns = require('dns');

// Force Node.js to use Google DNS for SRV record resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Fallback silently if setServers is restricted
}

const User = require('./models/User');
const Customer = require('./models/Customer');
const Lead = require('./models/Lead');
const Task = require('./models/Task');
const Setting = require('./models/Setting');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trishul-crm';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGO_URI, { family: 4 });
    console.log('Connected to MongoDB.');


    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Customer.deleteMany({}),
      Lead.deleteMany({}),
      Task.deleteMany({}),
      Setting.deleteMany({}),
    ]);
    console.log('Cleared existing database records.');

    // Password Hashing
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Create Users (Admin, Supervisor, Agent)
    const admin = await User.create({
      name: 'Vikramaditya Sharma',
      email: 'admin@trishul.com',
      passwordHash,
      role: 'admin',
      department: 'Executive & AI Lead',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    });

    const supervisor = await User.create({
      name: 'Ananya Deshmukh',
      email: 'supervisor@trishul.com',
      passwordHash,
      role: 'supervisor',
      supervisorId: admin._id,
      department: 'Sales Management',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    });

    const agent = await User.create({
      name: 'Rohan Verma',
      email: 'agent@trishul.com',
      passwordHash,
      role: 'user',
      supervisorId: supervisor._id,
      department: 'Field Sales',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    });

    console.log('Seeded Users: Admin, Supervisor, Agent (Password: password123)');

    // 2. Create Customers
    const customers = await Customer.insertMany([
      {
        name: 'Aarav Sharma',
        company: 'Apex Global Solutions',
        phone: '+91 98765 43210',
        email: 'aarav@apexglobal.in',
        address: 'Bandra West, Mumbai, Maharashtra',
        status: 'active',
        value: 450000,
        notes: 'Enterprise contract renewed for Q3.',
        createdBy: admin._id,
      },
      {
        name: 'Priya Nair',
        company: 'Zenith Tech Infra',
        phone: '+91 98123 45678',
        email: 'priya.n@zenithtech.com',
        address: 'MG Road, Bengaluru, Karnataka',
        status: 'active',
        value: 820000,
        notes: 'Key account interested in AI suite.',
        createdBy: supervisor._id,
      },
      {
        name: 'Rajesh Kulkarni',
        company: 'Vanguard Logistics',
        phone: '+91 97654 32109',
        email: 'r.kulkarni@vanguard.co.in',
        address: 'Hitech City, Hyderabad, Telangana',
        status: 'new',
        value: 290000,
        notes: 'Requires onboarding call next Tuesday.',
        createdBy: agent._id,
      },
      {
        name: 'Meera Sen',
        company: 'Kolkata Craft Export',
        phone: '+91 99001 12233',
        email: 'meera@kolkatacraft.org',
        address: 'Park Street, Kolkata, West Bengal',
        status: 'inactive',
        value: 110000,
        notes: 'Dormant account since April.',
        createdBy: agent._id,
      },
    ]);
    console.log(`Seeded ${customers.length} Customers.`);

    // 3. Create Leads
    const leads = await Lead.insertMany([
      {
        name: 'Sunil Agarwal',
        company: 'Horizon Financial Services',
        phone: '+91 98334 11223',
        email: 'sunil@horizonfin.in',
        source: 'Website Form',
        status: 'interested',
        value: 500000,
        assignedTo: agent._id,
        createdBy: admin._id,
      },
      {
        name: 'Kavita Reddy',
        company: 'BioGenix Healthcare',
        phone: '+91 97441 22334',
        email: 'kavita.r@biogenix.org',
        source: 'LinkedIn Campaign',
        status: 'contacted',
        value: 350000,
        assignedTo: supervisor._id,
        createdBy: supervisor._id,
      },
      {
        name: 'Vikrant Singh',
        company: 'Titanium CyberSec',
        phone: '+91 99112 33445',
        email: 'vikrant@titaniumcyber.io',
        source: 'Partner Referral',
        status: 'won',
        value: 1200000,
        assignedTo: admin._id,
        createdBy: admin._id,
      },
      {
        name: 'Neha Joshi',
        company: 'CloudScale Systems',
        phone: '+91 98223 44556',
        email: 'neha@cloudscale.net',
        source: 'Cold Call',
        status: 'new',
        value: 280000,
        assignedTo: agent._id,
        createdBy: agent._id,
      },
    ]);
    console.log(`Seeded ${leads.length} Leads.`);

    // 4. Create Tasks
    const tasks = await Task.insertMany([
      {
        title: 'Schedule Q3 Strategic Review with Zenith Tech',
        assignedTo: agent._id,
        dueDate: new Date(Date.now() + 86400000 * 3),
        priority: 'high',
        category: 'Sales',
        completed: false,
        createdBy: supervisor._id,
      },
      {
        title: 'Send customized proposal to Horizon Financial',
        assignedTo: supervisor._id,
        dueDate: new Date(Date.now() + 86400000 * 2),
        priority: 'high',
        category: 'Follow-up',
        completed: false,
        createdBy: admin._id,
      },
      {
        title: 'Verify export documents for Kolkata Craft',
        assignedTo: agent._id,
        dueDate: new Date(Date.now() + 86400000 * 5),
        priority: 'medium',
        category: 'Operations',
        completed: true,
        createdBy: agent._id,
      },
    ]);
    console.log(`Seeded ${tasks.length} Tasks.`);

    // 5. Create Company Settings
    await Setting.create({
      companyName: 'Trishul Global Enterprise',
      logoUrl: '',
      theme: 'dark',
      updatedBy: admin._id,
    });
    console.log('Seeded Company Settings.');

    console.log('\n✅ Trishul CRM Seeding Finished Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
    process.exit(1);
  }
}

seedDatabase();
