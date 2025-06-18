const Expense = require('../models/Expense');
const { validationResult } = require('express-validator');
const Decimal = require('decimal.js');

// Get all expenses
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ created_at: -1 });
    res.json({
      success: true,
      data: expenses,
      message: 'Expenses retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving expenses',
      error: error.message
    });
  }
};

// Create new expense
exports.createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { amount, description, paid_by, split_type, split_details } = req.body;

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Create split details if not provided
    let finalSplitDetails = split_details;
    if (split_type === 'equal' && !split_details) {
      const people = Object.keys(split_details || {});
      const share = new Decimal(amount).div(people.length).toFixed(2);
      finalSplitDetails = people.reduce((acc, person) => {
        acc[person] = share;
        return acc;
      }, {});
    }

    const expense = new Expense({
      amount,
      description,
      paid_by,
      split_type,
      split_details: finalSplitDetails
    });

    await expense.save();

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating expense',
      error: error.message
    });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, paid_by, split_type, split_details } = req.body;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Update fields
    if (amount) expense.amount = amount;
    if (description) expense.description = description;
    if (paid_by) expense.paid_by = paid_by;
    if (split_type) expense.split_type = split_type;
    if (split_details) expense.split_details = split_details;

    await expense.save();

    res.json({
      success: true,
      data: expense,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
};

// Get all people from expenses
exports.getAllPeople = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const people = new Set();

    expenses.forEach(expense => {
      people.add(expense.paid_by);
      Object.keys(expense.split_details).forEach(person => people.add(person));
    });

    res.json({
      success: true,
      data: Array.from(people),
      message: 'People retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving people',
      error: error.message
    });
  }
}; 