const mongoose = require('mongoose');

const SuperadminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'superadmin' },
  managedCompanies: [{ type: String }] // Array of company IDs or names this CEO controls
}, { timestamps: true });

module.exports = mongoose.model('Superadmin', SuperadminSchema);