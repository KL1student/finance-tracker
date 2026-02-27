# Deployment Guide - Finance Tracker

Follow these steps to host your application online and enable multi-device synchronization using Google Sheets.

## Phase 1: Set Up Google Sheets (Database)

1.  **Create a New Sheet**: Go to [sheets.new](https://sheets.new).
2.  **Open Apps Script**: Click on `Extensions` > `Apps Script`.
3.  **Replace Code**: Copy the contents of `google_apps_script.js` from this project and paste them into the script editor (replace everything).
4.  **Deploy**:
    - Click `Deploy` > `New Deployment`.
    - Select `Web App`.
    - Set `Execute as`: `Me`.
    - Set `Who has access`: `Anyone` (required for the app to connect).
    - Click `Deploy` and **Copy the Web App URL**.

## Phase 2: Connect the App

1.  **Open Your Hosted App**: Once deployed (Phase 3), open the URL.
2.  **Open Settings**: Click the ⚙️ icon in the header.
3.  **Paste URL**: Paste the Google Apps Script URL you copied earlier.
4.  **Save**: Click `Save & Connect`. Your data will now automatically sync!

## Phase 3: Host the Frontend (Netlify - Recommended)

### Option A: Drag & Drop (Easiest)
1.  **Build the Project**: Run `npm run build` in your terminal.
2.  **Locate 'dist' folder**: This command creates a folder named `dist` in your project directory.
3.  **Go to Netlify**: Visit [app.netlify.com/drop](https://app.netlify.com/drop).
4.  **Upload**: Drag the `dist` folder onto the Netlify drop zone.
5.  **Done**: Your app is live! Netlify will provide a link like `your-app-name.netlify.app`.

### Option B: GitHub Sync (Best for Updates)
1.  **Upload to GitHub**: Push your project to a GitHub repository.
2.  **Connect to Netlify**: In Netlify, click `Add new site` > `Import from existing project`.
3.  **Build Settings**:
    - Build Command: `npm run build`
    - Publish directory: `dist`
4.  **Deploy**: Every time you push to GitHub, your app will automatically update.

---

> [!TIP]
> **Mobile Access**: Once hosted, simply open the Netlify link on your phone. Log in to your Google Sheet settings once, and you can track your finance on the go!

> [!WARNING]
> **Privacy**: Your Google Sheet URL should be kept private. Do not share it publicly as anyone with the link could potentially read or edit your data.
