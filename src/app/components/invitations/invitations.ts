import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InvitationService } from '../../services/invitation.service';
import { ProjectInvitation } from '../../models/project.model';

@Component({
    selector: 'app-invitations',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './invitations.html',
    styleUrl: './invitations.css'
})
export class InvitationsComponent implements OnInit {
    invitations: ProjectInvitation[] = [];
    loading = false;

    constructor(private invitationService: InvitationService) { }

    ngOnInit() {
        this.loadInvitations();
    }

    loadInvitations() {
        this.loading = true;
        this.invitationService.getMyInvitations().subscribe({
            next: (data) => {
                this.invitations = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading invitations', err);
                this.loading = false;
            }
        });
    }

    acceptInvitation(invitationId: number) {
        this.invitationService.acceptInvitation(invitationId).subscribe({
            next: () => {
                this.loadInvitations(); // Refresh list
            },
            error: (err) => console.error('Error accepting invitation', err)
        });
    }

    rejectInvitation(invitationId: number) {
        this.invitationService.rejectInvitation(invitationId).subscribe({
            next: () => {
                this.loadInvitations(); // Refresh list
            },
            error: (err) => console.error('Error rejecting invitation', err)
        });
    }
}
