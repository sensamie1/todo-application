const mongoose = require('mongoose');


const Schema = mongoose.Schema;

const TaskSchema = new Schema({
  task_name: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String, 
    required: true,
    enum: ['pending', 'completed', 'deleted'],
    default: 'pending'
  },
  user_id: [{
    type: Schema.Types.ObjectId,
    ref: 'users',
  }],
  start_date: { type: Date, default: new Date()},
  due_date: { 
    type: Date, 
    default: () => {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 5); // setting default value as 5 days from the current date
      return currentDate;
    }, 
  },
  created_at: { type: Date, default: new Date() },
});

const TaskModel = mongoose.model('tasks', TaskSchema);

module.exports = TaskModel;
