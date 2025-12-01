import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AiAnalysis {
    id: number;
    analysisType: string;
    result: string;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class AiService {
    private apiUrl = `${environment.apiUrl}`;

    constructor(private http: HttpClient) { }

    getProjectAnalysis(projectId: number): Observable<AiAnalysis[]> {
        return this.http.get<AiAnalysis[]>(`${this.apiUrl}/projects/${projectId}/ai-analysis`);
    }

    generateAnalysis(projectId: number, type: string): Observable<AiAnalysis> {
        return this.http.post<AiAnalysis>(`${this.apiUrl}/projects/${projectId}/ai-analysis`, { type });
    }
}
