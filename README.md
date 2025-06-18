# Expense Splitter Backend

A robust backend system for splitting expenses between groups of people, similar to Splitwise or Google Pay Bills Split.

## Features

- Expense tracking with detailed information
- Automatic person management
- Settlement calculations
- Data validation and error handling
- Support for different expense splitting methods (equal, percentage, exact amounts)

## Tech Stack

- Node.js with Express.js
- MongoDB with Mongoose
- Express Validator for input validation
- Decimal.js for precise money calculations

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Expense Management

#### GET /expenses
List all expenses

#### POST /expenses
Add new expense
```json
{
  "amount": 60.00,
  "description": "Dinner at restaurant",
  "paid_by": "Shantanu",
  "split_type": "equal",
  "split_details": {
    "Shantanu": 20,
    "Sanket": 20,
    "Om": 20
  }
}
```

#### PUT /expenses/:id
Update existing expense

#### DELETE /expenses/:id
Delete an expense

### Settlement Calculations

#### GET /settlements
Get current settlement summary

#### GET /balances
Show each person's balance (owes/owed)

#### GET /people
List all people (derived from expenses)

## Settlement Calculation Logic

The system uses a graph-based algorithm to minimize the number of transactions needed for settlements. It:

1. Calculates net balances for each person
2. Identifies debtors and creditors
3. Creates a minimum number of transactions to settle all debts
4. Optimizes the settlement path to reduce the number of transactions

## Error Handling

The API returns appropriate HTTP status codes and clear error messages:

- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Testing

The API can be tested using the provided Postman collection. Import the collection from the GitHub Gist and use the deployed API base URL.

## Deployment

The application is deployed on [Railway.app](https://railway.app) and uses MongoDB Atlas for the database.

## Known Limitations

- Maximum precision for money calculations is 2 decimal places
- Person names are case-sensitive
- No support for currency conversion
- No authentication system (for demo purposes) 