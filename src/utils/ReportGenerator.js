import * as XLSX from 'xlsx';

export const generateMonthlyReport = (transactions, monthYearStr) => {
    // Filter transactions for the specific month/year if needed, 
    // but usually the caller passes already filtered transactions.
    // We'll assume 'transactions' are already filtered for the view.

    const data = transactions.map(t => ({
        Date: t.date,
        Supplier: t.supplier,
        Client: t.clientName,
        Type: t.type.toUpperCase(),
        Amount: t.amount,
    }));

    // Calculate totals
    const totalCredit = transactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalDebit = transactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + Number(t.amount), 0);

    const net = totalCredit - totalDebit;

    // Add Summary Rows
    data.push({}); // Empty row
    data.push({ Description: 'Total Credit', Amount: totalCredit });
    data.push({ Description: 'Total Debit', Amount: totalDebit });
    data.push({ Description: 'Net Balance', Amount: net });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Report");

    XLSX.writeFile(workbook, `Finance_Report_${monthYearStr}.xlsx`);
};
