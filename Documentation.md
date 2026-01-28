# Technical Documentation & Setup Guide

## Authentication Setup

### 1. Habitica
1. Go to your [Habitica Settings > API](https://habitica.com/user/settings/api).
2. Copy your **User ID** and **API Token**.
3. Paste these into the Extension Popup.

### 2. Google Tasks (OAuth 2.0)
To run this extension yourself, you need to create your own Google OAuth Client ID:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project.
3. Enable the **Google Tasks API** under "APIs & Services > Library".
4. Go to "APIs & Services > Credentials".
5. Click **Create Credentials > OAuth client ID**.
6. Application Type: **Web application**.
7. Authorized JavaScript origins: `https://<YOUR_EXTENSION_ID>.chromiumapp.org`. (Get your ID from `chrome://extensions` after loading the unpacked `dist` folder).
8. Copy the **Client ID** (the part before `.apps.googleusercontent.com`).
9. Create a `.env` file in the project root (or copy `.env.example`).
10. Add your ID: `VITE_GOOGLE_CLIENT_ID=your_id_here`.
11. Run `npm run build`. The build process will automatically inject this into the final manifest.

## Sync Logic Details

### Difficulty Mapping
The extension maps Habitica difficulty levels to stars at the end of the Google Task title:
- **Trivial** (0.1) ↔ `Task Title *`
- **Easy** (1.0) ↔ `Task Title **`
- **Medium** (1.5) ↔ `Task Title ***`
- **Hard** (2.0) ↔ `Task Title ****`

### Conflict Resolution
The sync logic follows a "Completion Wins" strategy. If a task is marked as done on either platform, the sync engine will update the other platform to match.

### Performance
The extension uses **Content Scripts** to detect clicks on checkboxes in Habitica and Google Tasks. Detection triggers an immediate background sync, making updates feel near-instant. A fallback polling mechanism runs every 5 minutes.

## File Structure
- `src/background/`: Contains the main sync engine.
- `src/lib/`: API clients for Habitica and Google.
- `src/popup/`: UI logic and styling for the extension window.
- `src/content/`: Observer scripts for real-time interaction detection.
- `src/manifest.json`: Extension configuration.
