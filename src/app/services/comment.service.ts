import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';

export interface Comment {
    id: number;
    content: string;
    taskId: number;
    taskTitle: string;
    userId: number;
    userName: string;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class CommentService {
    private apiUrl = `${config.apiUrl}`;

    constructor(private http: HttpClient) { }

    getTaskComments(taskId: number): Observable<Comment[]> {
        return this.http.get<Comment[]>(`${this.apiUrl}/tasks/${taskId}/comments`);
    }

    createComment(taskId: number, content: string): Observable<Comment> {
        return this.http.post<Comment>(`${this.apiUrl}/tasks/${taskId}/comments`, { content });
    }

    deleteComment(commentId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
    }
}
