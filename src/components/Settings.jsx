import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';

const Settings = ({ onClose }) => {
    const { googleSheetUrl, setGoogleSheetUrl } = useFinance();
    const [url, setUrl] = useState(googleSheetUrl || '');

    const handleSave = () => {
        setGoogleSheetUrl(url);
        alert('Settings Saved! The app will now sync with this Sheet.');
        onClose();
    };

    return (
        <div className="settings-modal-overlay">
            <div className="settings-modal">
                <h3>Connect Google Sheet</h3>
                <p>Enter the Web App URL from your Google Apps Script deployment.</p>

                <input
                    type="text"
                    placeholder="https://script.google.com/macros/s/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />

                <div className="actions">
                    <button onClick={handleSave} className="save-btn">Save & Connect</button>
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                </div>

                <div className="help-text">
                    <small>Don't have a URL? Check <code>google_sheets_guide.md</code> in the project folder.</small>
                </div>
            </div>
        </div>
    );
};

export default Settings;
