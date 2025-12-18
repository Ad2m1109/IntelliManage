import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';

export interface Attachment {
    id: number;
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
    taskId: number;
    uploadedById: number;
    uploadedByName: string;
    uploadedAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class AttachmentService {
    private apiUrl = `${config.apiUrl}`;

    constructor(private http: HttpClient) { }

    getTaskAttachments(taskId: number): Observable<Attachment[]> {
        return this.http.get<Attachment[]>(`${this.apiUrl}/tasks/${taskId}/attachments`);
    }

    createAttachment(taskId: number, attachment: Partial<Attachment>): Observable<Attachment> {
        return this.http.post<Attachment>(`${this.apiUrl}/tasks/${taskId}/attachments`, attachment);
    }

    deleteAttachment(attachmentId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/attachments/${attachmentId}`);
    }
}
