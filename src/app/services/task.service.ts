import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task } from '../models/task.model';


@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private apiUrl = `${environment.apiUrl}`;

    constructor(private http: HttpClient) { }

    getProjectTasks(projectId: number): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/projects/${projectId}/tasks`);
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

    deleteTask(taskId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/tasks/${taskId}`);
    }
}
