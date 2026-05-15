const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  adminId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  branchName: { type: String, required: true }, // The office branch they manage
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Superadmin' } // Links back to the CEO who made them
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);