import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InvitationService } from '../../services/invitation.service';
import { ProjectInvitation } from '../../models/invitation.model';
import { HasRoleDirective } from '../../directives/has-role.directive';
import { HttpErrorResponse } from '@angular/common/http'; // Import HttpErrorResponse
import { NotificationService } from '../../services/notification.service'; // Import NotificationService

@Component({
    selector: 'app-invitations',
    standalone: true,
    imports: [CommonModule, RouterModule, HasRoleDirective],
    templateUrl: './invitations.html',
    styleUrl: './invitations.css'
})
export class InvitationsComponent implements OnInit {
    invitations: ProjectInvitation[] = [];
    loading = false;

    constructor(
        private invitationService: InvitationService,
        private notificationService: NotificationService // Inject NotificationService
    ) { }

    ngOnInit() {
        this.loadInvitations();
    }

    loadInvitations() {
        this.invitationService.getMyInvitations().subscribe({
            next: (data: ProjectInvitation[]) => { // Explicitly type data
                this.invitations = data;
                this.loading = false;
            },
            error: (err: HttpErrorResponse) => { // Explicitly type err
                this.notificationService.error(err.error?.message || 'Error loading invitations.');
                this.loading = false;
            }
        });
    }

    acceptInvitation(id: number) {
        this.invitationService.acceptInvitation(id).subscribe({
            next: () => {
                this.loadInvitations();
                this.notificationService.success('Invitation accepted successfully!');
            },
            error: (err: HttpErrorResponse) => { // Explicitly type err
                this.notificationService.error(err.error?.message || 'Error accepting invitation.');
            }
        });
    }

    rejectInvitation(id: number) {
        this.invitationService.rejectInvitation(id).subscribe({
            next: () => {
                this.loadInvitations();
                this.notificationService.info('Invitation rejected.');
            },
            error: (err: HttpErrorResponse) => { // Explicitly type err
                this.notificationService.error(err.error?.message || 'Error rejecting invitation.');
            }
        });
    }
}
