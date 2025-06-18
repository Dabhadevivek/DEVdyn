const express = require('express');
const { body, param } = require('express-validator');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

// Validation middleware
const validateExpense = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('paid_by')
    .trim()
    .notEmpty()
    .withMessage('Paid by is required'),
  body('split_type')
    .isIn(['equal', 'percentage', 'exact'])
    .withMessage('Invalid split type'),
  body('split_details')
    .isObject()
    .withMessage('Split details must be an object')
];

// Routes
router.get('/', expenseController.getAllExpenses);
router.get('/people', expenseController.getAllPeople);

router.post('/', validateExpense, expenseController.createExpense);

router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid expense ID'),
  ...validateExpense
], expenseController.updateExpense);

router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid expense ID')
], expenseController.deleteExpense);

module.exports = router; 