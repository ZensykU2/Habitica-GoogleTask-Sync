import { GoogleTask } from '../types';

export class GoogleTasksClient {
    private token: string;

    constructor(token: string) {
        this.token = token;
    }

    private async request(method: string, endpoint: string, body?: any) {
        const headers = {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };

        const response = await fetch(`https://tasks.googleapis.com/tasks/v1${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            throw new Error(`Google Tasks API Error: ${response.statusText}`);
        }

        if (method === 'DELETE' || response.status === 204) return null;
        return response.json();
    }

    async getTaskLists() {
        return this.request('GET', '/users/@me/lists');
    }

    async getTasks(listId: string = '@default'): Promise<GoogleTask[]> {
        const data = await this.request('GET', `/lists/${listId}/tasks?showCompleted=true&showHidden=true`);
        return (data.items || []).map((item: any) => ({
            id: item.id,
            title: item.title,
            status: item.status,
            due: item.due
        }));
    }

    async createTask(title: string, listId: string = '@default'): Promise<GoogleTask> {
        const item = await this.request('POST', `/lists/${listId}/tasks`, { title });
        return {
            id: item.id,
            title: item.title,
            status: item.status
        };
    }

    async updateTask(taskId: string, updates: Partial<GoogleTask>, listId: string = '@default'): Promise<void> {
        await this.request('PATCH', `/lists/${listId}/tasks/${taskId}`, updates);
    }

    async deleteTask(taskId: string, listId: string = '@default'): Promise<void> {
        await this.request('DELETE', `/lists/${listId}/tasks/${taskId}`);
    }
}
