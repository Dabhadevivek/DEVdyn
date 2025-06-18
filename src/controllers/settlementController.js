const Expense = require('../models/Expense');
const Decimal = require('decimal.js');

// Calculate balances for all people
exports.getBalances = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const balances = new Map();

    // Initialize balances for all people
    expenses.forEach(expense => {
      if (!balances.has(expense.paid_by)) {
        balances.set(expense.paid_by, new Decimal(0));
      }
      Object.keys(expense.split_details).forEach(person => {
        if (!balances.has(person)) {
          balances.set(person, new Decimal(0));
        }
      });
    });

    // Calculate net balances
    expenses.forEach(expense => {
      // Add amount to payer's balance
      balances.set(
        expense.paid_by,
        balances.get(expense.paid_by).plus(expense.amount)
      );

      // Subtract shares from each person's balance
      Object.entries(expense.split_details).forEach(([person, share]) => {
        balances.set(
          person,
          balances.get(person).minus(share)
        );
      });
    });

    // Convert to array of objects
    const balanceArray = Array.from(balances.entries()).map(([person, balance]) => ({
      person,
      balance: balance.toFixed(2)
    }));

    res.json({
      success: true,
      data: balanceArray,
      message: 'Balances calculated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating balances',
      error: error.message
    });
  }
};

// Calculate optimized settlements
exports.getSettlements = async (req, res) => {
  try {
    const expenses = await Expense.find();
    const balances = new Map();
    const settlements = [];

    // Calculate initial balances
    expenses.forEach(expense => {
      if (!balances.has(expense.paid_by)) {
        balances.set(expense.paid_by, new Decimal(0));
      }
      Object.keys(expense.split_details).forEach(person => {
        if (!balances.has(person)) {
          balances.set(person, new Decimal(0));
        }
      });
    });

    // Calculate net balances
    expenses.forEach(expense => {
      balances.set(
        expense.paid_by,
        balances.get(expense.paid_by).plus(expense.amount)
      );
      Object.entries(expense.split_details).forEach(([person, share]) => {
        balances.set(
          person,
          balances.get(person).minus(share)
        );
      });
    });

    // Separate debtors and creditors
    const debtors = [];
    const creditors = [];

    balances.forEach((balance, person) => {
      const amount = balance.toNumber();
      if (amount < -0.01) {
        debtors.push({ person, amount: Math.abs(amount) });
      } else if (amount > 0.01) {
        creditors.push({ person, amount });
      }
    });

    // Sort by amount
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    // Calculate settlements
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];

      const settlementAmount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: debtor.person,
        to: creditor.person,
        amount: settlementAmount.toFixed(2)
      });

      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;

      if (debtor.amount < 0.01) debtors.shift();
      if (creditor.amount < 0.01) creditors.shift();
    }

    res.json({
      success: true,
      data: settlements,
      message: 'Settlements calculated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error calculating settlements',
      error: error.message
    });
  }
}; 