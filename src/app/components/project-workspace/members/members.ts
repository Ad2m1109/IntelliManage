import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStateService } from '../../../services/project-state.service';
import { MemberService } from '../../../services/member.service';
import { ProjectMember } from '../../../models/project.model';
import { InvitationService } from '../../../services/invitation.service';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-project-members',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './members.html',
    styleUrl: './members.css'
})
export class ProjectMembersComponent implements OnInit {
    members: ProjectMember[] = [];
    loading = false;
    isFounder = false;

    constructor(
        private projectState: ProjectStateService,
        private memberService: MemberService,
        private invitationService: InvitationService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.isFounder = this.authService.isFounder();
        this.projectState.selectedProject$.subscribe(project => {
            if (project) {
                this.loadMembers(project.id);
            }
        });
    }

    loadMembers(projectId: number) {
        this.loading = true;
        this.memberService.getProjectMembers(projectId).subscribe({
            next: (data) => {
                this.members = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading members', err);
                this.loading = false;
            }
        });
    }

    inviteMember() {
        // TODO: Implement invite modal
        console.log('Invite member clicked');
    }
}
