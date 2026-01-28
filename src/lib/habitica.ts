import axios from 'axios';
import { HabiticaTask } from '../types';

export class HabiticaClient {
    private baseUrl = 'https://habitica.com/api/v3';

    constructor(private userId: string, private apiToken: string) { }

    private get headers() {
        return {
            'x-api-user': this.userId,
            'x-api-key': this.apiToken,
            'x-client': `${this.userId}-HabiticaGoogleSyncExtension`
        };
    }

    async getTasks(): Promise<HabiticaTask[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/tasks/user?type=todos`, {
                headers: this.headers
            });
            return response.data.data.map((task: any) => ({
                id: task.id,
                text: task.text,
                completed: task.completed,
                date: task.date,
                priority: task.priority
            }));
        } catch (error) {
            console.error('Habitica getTasks error:', error);
            throw error;
        }
    }

    async createTask(text: string, priority: number = 1, notes?: string): Promise<HabiticaTask> {
        try {
            const response = await axios.post(`${this.baseUrl}/tasks/user`, {
                text,
                type: 'todo',
                priority,
                notes
            }, { headers: this.headers });
            const task = response.data.data;
            return {
                id: task.id,
                text: task.text,
                completed: task.completed,
                priority: task.priority
            };
        } catch (error) {
            console.error('Habitica createTask error:', error);
            throw error;
        }
    }

    async scoreTask(taskId: string, direction: 'up' | 'down' = 'up'): Promise<void> {
        try {
            await axios.post(`${this.baseUrl}/tasks/${taskId}/score/${direction}`, {}, {
                headers: this.headers
            });
        } catch (error) {
            console.error('Habitica scoreTask error:', error);
            throw error;
        }
    }

    async deleteTask(taskId: string): Promise<void> {
        try {
            await axios.delete(`${this.baseUrl}/tasks/${taskId}`, {
                headers: this.headers
            });
        } catch (error) {
            console.error('Habitica deleteTask error:', error);
            throw error;
        }
    }
}
