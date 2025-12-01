import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProjectInvitation } from '../models/project.model';

@Injectable({
    providedIn: 'root'
})
export class InvitationService {
    private apiUrl = `${environment.apiUrl}`;

    constructor(private http: HttpClient) { }

    sendInvitation(projectId: number, userId: number): Observable<ProjectInvitation> {
        return this.http.post<ProjectInvitation>(
            `${this.apiUrl}/projects/${projectId}/invitations`,
            { userId }
        );
    }

    getMyInvitations(): Observable<ProjectInvitation[]> {
        return this.http.get<ProjectInvitation[]>(`${this.apiUrl}/invitations/my-invitations`);
    }

    acceptInvitation(invitationId: number): Observable<ProjectInvitation> {
        return this.http.post<ProjectInvitation>(
            `${this.apiUrl}/invitations/${invitationId}/accept`,
            {}
        );
    }

    rejectInvitation(invitationId: number): Observable<ProjectInvitation> {
        return this.http.post<ProjectInvitation>(
            `${this.apiUrl}/invitations/${invitationId}/reject`,
            {}
        );
    }

    getProjectInvitations(projectId: number): Observable<ProjectInvitation[]> {
        return this.http.get<ProjectInvitation[]>(`${this.apiUrl}/projects/${projectId}/invitations`);
    }
}
