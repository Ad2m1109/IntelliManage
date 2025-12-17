import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';

export interface Sprint {
    id: number;
    name: string;
    goal: string;
    startDate: string;
    endDate: string;
    projectId: number;
    status: string; // PLANNED, ACTIVE, COMPLETED
    progress: number;
    tasks: any[];
}

@Injectable({
    providedIn: 'root'
})
export class SprintService {
    private apiUrl = `${config.apiUrl}`;

    constructor(private http: HttpClient) { }

    getProjectSprints(projectId: number): Observable<Sprint[]> {
        return this.http.get<Sprint[]>(`${this.apiUrl}/projects/${projectId}/sprints`);
    }

    createSprint(projectId: number, sprint: Partial<Sprint>): Observable<Sprint> {
        return this.http.post<Sprint>(`${this.apiUrl}/projects/${projectId}/sprints`, sprint);
    }

    updateSprint(sprintId: number, sprint: Partial<Sprint>): Observable<Sprint> {
        return this.http.put<Sprint>(`${this.apiUrl}/sprints/${sprintId}`, sprint);
    }

    deleteSprint(sprintId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/sprints/${sprintId}`);
    }
}
