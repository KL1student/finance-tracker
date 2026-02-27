/**
 * Google Apps Script for Finance Tracker
 * Handles multi-sheet synchronization for Transactions, Expenses, and Suppliers.
 */

const SHEETS = {
    TRANSACTIONS: "Transactions",
    EXPENSES: "Expenses",
    SUPPLIERS: "Suppliers"
};

function doGet(e) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const results = {};

    // Initialize and fetch all sheets
    Object.values(SHEETS).forEach(sheetName => {
        let sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
            sheet = ss.insertSheet(sheetName);
            if (sheetName === SHEETS.TRANSACTIONS) {
                sheet.appendRow(["Date", "Client", "Supplier", "Type", "Amount", "SupplierAmount", "ID"]);
            } else if (sheetName === SHEETS.EXPENSES) {
                sheet.appendRow(["Date", "Name", "Category", "Amount", "ID"]);
            } else if (sheetName === SHEETS.SUPPLIERS) {
                sheet.appendRow(["Name", "AllottedAmount"]);
            }
        }

        const data = sheet.getDataRange().getValues();
        if (data.length <= 1) {
            results[sheetName] = [];
        } else {
            const headers = data[0];
            const rows = data.slice(1);
            results[sheetName] = rows.map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    if (header) {
                        // Strip all spaces and convert to a clean camelCase key
                        const cleanHeader = String(header).replace(/\s+/g, '');
                        // Lowercase the very first letter for JS standard (e.g., SupplierAmount -> supplierAmount)
                        const finalKey = cleanHeader.charAt(0).toLowerCase() + cleanHeader.slice(1);
                        obj[finalKey] = row[index];
                    }
                });
                return obj;
            });
        }
    });

    return ContentService.createTextOutput(JSON.stringify(results))
        .setMimeType(ContentService.MimeType.JSON);
}

function logDebug(ss, title, message) {
    try {
        let logSheet = ss.getSheetByName("DebugLogs");
        if (!logSheet) {
            logSheet = ss.insertSheet("DebugLogs");
            logSheet.appendRow(["Timestamp", "Title", "Message"]);
        }
        logSheet.appendRow([new Date(), String(title), String(message)]);
    } catch (e) { }
}

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    try {
        if (!e.postData || !e.postData.contents) {
            throw new Error("No payload received from the app.");
        }

        const body = JSON.parse(e.postData.contents);
        const action = body.action || 'add';
        // Use dataType safely, fallback to type if missing
        const dataType = body.dataType || body.type;
        if (!dataType) throw new Error("No dataType or type provided in body.");

        const sheetName = SHEETS[dataType.toUpperCase() + 'S'] || dataType;
        let sheet = ss.getSheetByName(sheetName);

        if (!sheet) throw new Error("Sheet not found: " + sheetName);

        const data = sheet.getDataRange().getValues();
        const headers = data[0];

        if (action === 'delete') {
            const idField = dataType === 'supplier' ? 'name' : 'id';
            const colIndex = headers.findIndex(h => h && h.toLowerCase() === idField.toLowerCase());
            if (colIndex === -1) throw new Error("ID field not found for deletion");

            for (let i = 1; i < data.length; i++) {
                if (data[i][colIndex] == body.id) {
                    sheet.deleteRow(i + 1);
                    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
                        .setMimeType(ContentService.MimeType.JSON);
                }
            }
        }

        if (action === 'update' && dataType === 'supplier') {
            for (let i = 1; i < data.length; i++) {
                if (data[i][0] === body.name) {
                    sheet.getRange(i + 1, 2).setValue(body.allottedAmount);
                    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
                        .setMimeType(ContentService.MimeType.JSON);
                }
            }
            sheet.appendRow([body.name, body.allottedAmount]);
        }

        if (action === 'add' || !action) {
            const row = headers.map(header => {
                if (!header) return "";
                const cleanHeader = String(header).toLowerCase().replace(/\s+/g, '');
                let targetKey = Object.keys(body).find(key =>
                    String(key).toLowerCase().replace(/\s+/g, '') === cleanHeader
                );

                // Manual Overrides for mismatched frontend vs backend keys
                if (!targetKey) {
                    if (cleanHeader === 'client') targetKey = 'clientName';
                    if (cleanHeader === 'date') targetKey = 'date';
                    if (cleanHeader === 'supplier') targetKey = 'supplier';
                }

                return (targetKey && body[targetKey] !== undefined) ? body[targetKey] : "";
            });
            sheet.appendRow(row);
            return ContentService.createTextOutput(JSON.stringify({ status: "success", addedRow: row }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        logDebug(ss, "POST Error", error.toString() + " | Payload: " + (e.postData ? e.postData.contents : "none"));
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    } finally {
        lock.releaseLock();
    }
}
