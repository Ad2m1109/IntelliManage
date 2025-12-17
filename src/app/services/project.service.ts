import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';
import { Project } from '../models/project.model';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private apiUrl = `${config.apiUrl}/projects`;

    constructor(private http: HttpClient) { }

    getProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(this.apiUrl);
    }

    // Founder-specific list (projects created by the authenticated founder)
    getFounderProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(`${this.apiUrl}/founder`);
    }

    // Employee-specific list (projects the employee has joined)
    getEmployeeProjects(): Observable<Project[]> {
        return this.http.get<Project[]>(`${this.apiUrl}/employee`);
    }

    getProject(id: number): Observable<Project> {
        return this.http.get<Project>(`${this.apiUrl}/${id}`);
    }

    createProject(project: Partial<Project>): Observable<Project> {
        return this.http.post<Project>(this.apiUrl, project);
    }

    updateProject(id: number, project: Partial<Project>): Observable<Project> {
        return this.http.put<Project>(`${this.apiUrl}/${id}`, project);
    }

    deleteProject(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getDashboardData(projectId: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${projectId}/dashboard`);
    }
}
