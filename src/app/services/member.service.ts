import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';
import { ProjectMember } from '../models/project-member.model';

@Injectable({
    providedIn: 'root'
})
export class MemberService {
    private apiUrl = `${config.apiUrl}`;

    constructor(private http: HttpClient) { }

    getProjectMembers(projectId: number): Observable<ProjectMember[]> {
        return this.http.get<ProjectMember[]>(`${this.apiUrl}/projects/${projectId}/members`);
    }

    removeMember(projectId: number, userId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}/members/${userId}`);
    }
}
