import { HabiticaClient } from '../lib/habitica';
import { GoogleTasksClient } from '../lib/google';
import { TaskMapping } from '../types';

let isSyncing = false;

chrome.alarms.create('periodicSync', { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'periodicSync') {
        performSync();
    }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'MANUAL_SYNC' || message.type === 'TRIGGER_SYNC') {
        performSync().then((res) => sendResponse(res));
        return true;
    }
    return;
});

async function performSync() {
    if (isSyncing) return { status: 'Already syncing' };
    isSyncing = true;
    console.log('Starting Sync Phase 2...');

    try {
        const config = await chrome.storage.sync.get(['habiticaUserId', 'habiticaApiToken', 'syncEnabled']);
        if (!config.syncEnabled || !config.habiticaUserId || !config.habiticaApiToken) {
            return { status: 'Sync disabled/configured' };
        }

        const token = await getGoogleToken();
        if (!token) return { status: 'Google Auth missing' };

        const habitica = new HabiticaClient(config.habiticaUserId, config.habiticaApiToken);
        const google = new GoogleTasksClient(token);

        const [hTasks, gTasks] = await Promise.all([
            habitica.getTasks(),
            google.getTasks()
        ]);

        const result = await chrome.storage.local.get('taskMapping');
        let mapping: TaskMapping[] = result.taskMapping || [];
        let newMapping: TaskMapping[] = [];

        for (const map of mapping) {
            const hTask = hTasks.find(t => t.id === map.habiticaId);
            const gTask = gTasks.find(t => t.id === map.googleTaskId);

            if (!hTask && !gTask) continue;

            if (hTask && !gTask) {
                console.log(`Sync: Task ${hTask.text} deleted in Google. Deleting in Habitica.`);
                await habitica.deleteTask(hTask.id);
                continue;
            }

            if (gTask && !hTask) {
                console.log(`Sync: Task ${gTask.title} deleted in Habitica. Deleting in Google.`);
                await google.deleteTask(gTask.id);
                continue;
            }

            if (hTask && gTask) {
                if (hTask.completed && gTask.status === 'needsAction') {
                    await google.updateTask(gTask.id, { status: 'completed' });
                } else if (!hTask.completed && gTask.status === 'completed') {
                    await habitica.scoreTask(hTask.id, 'up');
                }

                const expectedGTitle = formatTitleWithStars(hTask.text, hTask.priority);
                if (gTask.title !== expectedGTitle) {
                    console.log(`Syncing title/stars for ${hTask.text}`);
                    await google.updateTask(gTask.id, { title: expectedGTitle });
                }

                newMapping.push(map);
            }
        }

        const unmappedHTasks = hTasks.filter(h => !mapping.find(m => m.habiticaId === h.id));
        for (const h of unmappedHTasks) {
            if (h.completed) continue;
            const newTitle = formatTitleWithStars(h.text, h.priority);
            const newG = await google.createTask(newTitle);
            newMapping.push({ habiticaId: h.id, googleTaskId: newG.id });
        }

        const unmappedGTasks = gTasks.filter(g => !mapping.find(m => m.googleTaskId === g.id));
        for (const g of unmappedGTasks) {
            if (g.status === 'completed') continue;
            const { title, priority } = parseTitleAndStars(g.title);
            const newH = await habitica.createTask(title, priority);
            newMapping.push({ habiticaId: newH.id, googleTaskId: g.id });
        }

        await chrome.storage.local.set({ taskMapping: newMapping });
        return { status: 'Sync Complete' };

    } catch (error: any) {
        console.error('Sync failed:', error);
        return { status: `Error: ${error.message}` };
    } finally {
        isSyncing = false;
    }
}

function formatTitleWithStars(text: string, priority: number): string {
    const cleanText = text.replace(/\s*\*+$/, '').trim();
    let stars = '';
    if (priority === 0.1) stars = ' *';
    else if (priority === 1) stars = ' **';
    else if (priority === 1.5) stars = ' ***';
    else if (priority === 2) stars = ' ****';
    return `${cleanText}${stars}`;
}

function parseTitleAndStars(fullTitle: string): { title: string, priority: number } {
    const match = fullTitle.match(/^(.*?)\s*(\*+)$/);
    if (!match) return { title: fullTitle, priority: 1 };

    const title = match[1].trim();
    const stars = match[2];
    let priority = 1;
    if (stars === '*') priority = 0.1;
    else if (stars === '**') priority = 1;
    else if (stars === '***') priority = 1.5;
    else if (stars === '****') priority = 2;

    return { title, priority };
}

function getGoogleToken(): Promise<string | null> {
    return new Promise((resolve) => {
        chrome.identity.getAuthToken({ interactive: false }, (token) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                resolve(null);
            } else {
                resolve(token || null);
            }
        });
    });
}
