# Habitica <-> Google Tasks Sync Extension

A Chrome Extension built with TypeScript and Vite that provides 2-way synchronization between Habitica and Google Tasks. 

## Features
- **2-Way Sync**: Status updates (checks) and task creation synchronize instantly between platforms.
- **Deletion Sync**: Deleting a task on one side removes it from the other.
- **Difficulty Mapping**: Automatic conversion between Habitica difficulty levels and Google Task titles using trailing stars (`*` to `****`).
- **Input Persistence**: Drafts of your API keys are saved locally while you type to prevent data loss.

## Installation (Local Dev)
1. **Clone the repo.**
2. **Setup environment**: Rename `.env.example` to `.env` and add your Google Client ID.
3. **Install dependencies**: `npm install`.
4. **Build the project**: `npm run build`.
4. **Load into Chrome**:
   - Open `chrome://extensions/`.
   - Enable **Developer mode**.
   - Click **Load unpacked** and select the `dist` folder.

## Setup & Configuration
Detailed setup instructions for Google Cloud and Habitica API keys can be found in the [Documentation.md](./Documentation.md).

## Technology Stack
- **TypeScript**: Typed logic for rock-solid sync.
- **Vite**: Ultra-fast build tool for extension bundling.
- **Chrome Extension API V3**: Using modern service workers and host permissions.
- **Axios & Fetch**: API communication.

