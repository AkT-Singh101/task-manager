const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['To Do', 'Started', 'Midway', 'For Review', 'Completed'], default: 'To Do' },
  dueDate: { type: Date },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
