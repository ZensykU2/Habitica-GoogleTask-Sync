
const saveBtn = document.getElementById('saveBtn') as HTMLButtonElement;
const googleAuthBtn = document.getElementById('googleAuthBtn') as HTMLButtonElement;
const manualSyncBtn = document.getElementById('manualSyncBtn') as HTMLButtonElement;
const logoutBtn = document.getElementById('logoutBtn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLElement;

const habiticaUserIdInput = document.getElementById('habiticaUserId') as HTMLInputElement;
const habiticaTokenInput = document.getElementById('habiticaToken') as HTMLInputElement;
const syncEnabledCheckbox = document.getElementById('syncEnabled') as HTMLInputElement;
const displayUserId = document.getElementById('displayUserId') as HTMLElement;

const loggedOutView = document.getElementById('loggedOutView') as HTMLElement;
const loggedInView = document.getElementById('loggedInView') as HTMLElement;

chrome.storage.sync.get(['habiticaUserId', 'habiticaApiToken', 'syncEnabled'], (result) => {
    if (result.habiticaUserId && result.habiticaApiToken) {
        showLoggedIn(result.habiticaUserId);
    } else {
        chrome.storage.local.get(['draftUserId', 'draftToken'], (drafts) => {
            if (drafts.draftUserId) habiticaUserIdInput.value = drafts.draftUserId;
            if (drafts.draftToken) habiticaTokenInput.value = drafts.draftToken;
        });
        showLoggedOut();
    }

    if (result.syncEnabled !== undefined) {
        syncEnabledCheckbox.checked = result.syncEnabled;
    }
});

habiticaUserIdInput.addEventListener('input', () => {
    chrome.storage.local.set({ draftUserId: habiticaUserIdInput.value });
});

habiticaTokenInput.addEventListener('input', () => {
    chrome.storage.local.set({ draftToken: habiticaTokenInput.value });
});

function showLoggedIn(userId: string) {
    loggedOutView.classList.add('hidden');
    loggedInView.classList.remove('hidden');
    displayUserId.textContent = `ID: ${userId.substring(0, 8)}...`;
    chrome.storage.local.remove(['draftUserId', 'draftToken']);
}

function showLoggedOut() {
    loggedOutView.classList.remove('hidden');
    loggedInView.classList.add('hidden');
}

saveBtn.addEventListener('click', () => {
    const userId = habiticaUserIdInput.value.trim();
    const token = habiticaTokenInput.value.trim();

    if (!userId || !token) {
        updateStatus('Missing ID or Token', true);
        return;
    }

    chrome.storage.sync.set({
        habiticaUserId: userId,
        habiticaApiToken: token,
        syncEnabled: true
    }, () => {
        updateStatus('Successfully Connected!');
        showLoggedIn(userId);
    });
});

logoutBtn.addEventListener('click', () => {
    chrome.storage.sync.remove(['habiticaUserId', 'habiticaApiToken'], () => {
        showLoggedOut();
        updateStatus('Credentials Cleared');
        chrome.storage.local.remove(['draftUserId', 'draftToken']);
        habiticaUserIdInput.value = '';
        habiticaTokenInput.value = '';
    });
});

googleAuthBtn.addEventListener('click', () => {
    updateStatus('Connecting Google Account...');
    chrome.identity.getAuthToken({ interactive: true }, (_token) => {
        if (chrome.runtime.lastError) {
            updateStatus(`Auth Error: ${chrome.runtime.lastError.message}`, true);
        } else {
            updateStatus('Google Account linked!');
        }
    });
});

manualSyncBtn.addEventListener('click', () => {
    updateStatus('Syncing...');
    chrome.runtime.sendMessage({ type: 'MANUAL_SYNC' }, (response) => {
        if (response?.status) {
            updateStatus(response.status);
        }
    });
});

syncEnabledCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({ syncEnabled: syncEnabledCheckbox.checked }, () => {
        updateStatus(syncEnabledCheckbox.checked ? 'Auto-sync active' : 'Auto-sync disabled');
    });
});

function updateStatus(msg: string, isError: boolean = false) {
    statusDiv.textContent = msg;
    statusDiv.style.color = isError ? '#ef4444' : '#94a3b8';
    setTimeout(() => {
        if (statusDiv.textContent === msg) statusDiv.textContent = '';
    }, 3000);
}
