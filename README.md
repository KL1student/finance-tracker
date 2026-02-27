# Finance Tracker

A modern, responsive React web application designed for comprehensive financial management, supplier tracking, and multi-device data synchronization.

## Highlights
- **Dashboard Overview**: Instantly visualize global financial health, monthly profits, collections, and total expenses.
- **Supplier & Client Management**: Keep detailed ledgers of financial transactions separated by suppliers and their nested clients.
- **Automated Calculations**: Calculates remaining budgets, monthly nets, and running profits strictly based on selected timeframes.
- **Data Exporting**: Easily export your entire financial history directly to `.xlsx` format for external auditing or backup.
- **Dark Mode Support**: Built-in toggle for comfortable viewing in low-light environments.

## Technologies Used
- **Frontend Framework**: React 18, Vite
- **Styling**: Pure CSS3 with custom variables and responsive grid layouts
- **State Management**: React Context API
- **Deployment**: Configured for static site hosting (Netlify/Vercel)

## Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/KL1student/finance-tracker.git
   cd finance-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

4. **Build for production**
   ```bash
   npm run build
   ```

## Backend Configuration
This application is designed to act as a stateless frontend that pushes and pulls data via standard HTTP requests. You can connect it to any REST API endpoint that returns JSON arrays for Transactions, Expenses, and Suppliers by configuring the URL in the Settings panel (⚙️).

## License
MIT License
