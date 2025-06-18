const mongoose = require('mongoose');
const Decimal = require('decimal.js');

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative'],
    get: v => new Decimal(v).toFixed(2),
    set: v => new Decimal(v).toFixed(2)
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  paid_by: {
    type: String,
    required: true,
    trim: true
  },
  split_type: {
    type: String,
    enum: ['equal', 'percentage', 'exact'],
    required: true
  },
  split_details: {
    type: Map,
    of: Number,
    required: true,
    validate: {
      validator: function(splitDetails) {
        if (this.split_type === 'equal') {
          const total = Array.from(splitDetails.values()).reduce((a, b) => a + b, 0);
          return Math.abs(total - this.amount) < 0.01;
        }
        return true;
      },
      message: 'Split details must sum up to the total amount'
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Pre-save middleware to validate split details
expenseSchema.pre('save', function(next) {
  if (this.split_type === 'equal') {
    const total = Array.from(this.split_details.values()).reduce((a, b) => a + b, 0);
    if (Math.abs(total - this.amount) >= 0.01) {
      next(new Error('Split details must sum up to the total amount'));
    }
  }
  next();
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense; 