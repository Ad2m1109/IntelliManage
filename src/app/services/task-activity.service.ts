import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';

export interface TaskActivity {
    id: number;
    taskId: number;
    userId: number;
    userName: string;
    action: string;
    oldValue: string;
    newValue: string;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class TaskActivityService {
    private apiUrl = `${config.apiUrl}`;

    constructor(private http: HttpClient) { }

    getTaskActivities(taskId: number): Observable<TaskActivity[]> {
        return this.http.get<TaskActivity[]>(`${this.apiUrl}/tasks/${taskId}/activities`);
    }
}
