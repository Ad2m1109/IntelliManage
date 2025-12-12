import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';

export interface ProjectFile {
    id: number;
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedBy: string;
    uploadedAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class FileService {
    private apiUrl = `${config.apiUrl}`;

    constructor(private http: HttpClient) { }

    getProjectFiles(projectId: number): Observable<ProjectFile[]> {
        return this.http.get<ProjectFile[]>(`${this.apiUrl}/projects/${projectId}/attachments`);
    }

    uploadFile(projectId: number, file: File): Observable<ProjectFile> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<ProjectFile>(`${this.apiUrl}/projects/${projectId}/attachments`, formData);
    }

    deleteFile(fileId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/attachments/${fileId}`);
    }
}
