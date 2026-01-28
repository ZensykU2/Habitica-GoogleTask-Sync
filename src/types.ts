export interface HabiticaTask {
    id: string;
    text: string;
    completed: boolean;
    date?: string; // Due date
    priority: number; // Difficulty (0.1, 1, 1.5, 2)
}

export interface GoogleTask {
    id: string;
    title: string;
    status: 'needsAction' | 'completed';
    due?: string;
}

export interface TaskMapping {
    habiticaId: string;
    googleTaskId: string;
    lastSynced?: number;
}

export interface SyncConfig {
    habiticaUserId: string;
    habiticaApiToken: string;
    syncEnabled: boolean;
    lastSyncTimestamp?: number;
}
