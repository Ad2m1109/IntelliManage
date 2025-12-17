import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';
import { Task } from '../models/task.model';


import { HttpParams } from '@angular/common/http';

// ... (imports)

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private apiUrl = `${config.apiUrl}`;

    constructor(private http: HttpClient) { }

    getProjectTasks(projectId: number): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/projects/${projectId}/tasks`);
    }

    getFilteredTasks(projectId: number, filters: any): Observable<Task[]> {
        let params = new HttpParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params = params.append(key, filters[key]);
            }
        });
        return this.http.get<Task[]>(`${this.apiUrl}/projects/${projectId}/tasks/filter`, { params });
    }


    // Return tasks assigned to the authenticated user within a project
    getMyTasks(projectId: number): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/projects/${projectId}/tasks/me`);
    }

    createTask(projectId: number, task: Partial<Task>): Observable<Task> {
        return this.http.post<Task>(`${this.apiUrl}/projects/${projectId}/tasks`, task);
    }

    updateTask(taskId: number, task: Partial<Task>): Observable<Task> {
        return this.http.put<Task>(`${this.apiUrl}/tasks/${taskId}`, task);
    }

    updateTaskStatus(taskId: number, status: string): Observable<Task> {
        return this.http.put<Task>(`${this.apiUrl}/tasks/${taskId}/status`, { status });
    }

    deleteTask(taskId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/tasks/${taskId}`);
    }
}
