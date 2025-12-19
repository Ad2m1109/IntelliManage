import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStateService } from '../../../services/project-state.service';
import { MemberService } from '../../../services/member.service';
import { ProjectMember } from '../../../models/project-member.model';
import { InvitationService } from '../../../services/invitation.service';
import { AuthService } from '../../../services/auth.service';
import { SearchService } from '../../../services/search.service'; // Import SearchService
import { Subscription } from 'rxjs'; // Import Subscription
import { DialogService } from '../../../services/dialog.service'; // Import DialogService

import { InviteMemberDialogComponent } from '../../invite-member-dialog/invite-member-dialog.component'; // Import InviteMemberDialogComponent

@Component({
    selector: 'app-project-members',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './members.html',
    styleUrl: './members.css'
})
export class ProjectMembersComponent implements OnInit, OnDestroy { // Implement OnDestroy
    allMembers: ProjectMember[] = []; // Store all members
    filteredMembers: ProjectMember[] = []; // Store filtered members
    loading = false;
    isFounder = false;
    selectedProjectId?: number;
    private searchSubscription: Subscription = new Subscription(); // To manage search term subscription
    private projectStateSub: Subscription = new Subscription(); // To manage project state subscription

    constructor(
        private projectState: ProjectStateService,
        private memberService: MemberService,
        private invitationService: InvitationService,
        private authService: AuthService,
        private searchService: SearchService, // Inject SearchService
        private dialogService: DialogService // Inject DialogService
    ) { }

    ngOnInit() {
        this.isFounder = this.authService.isFounder();
        this.projectStateSub = this.projectState.selectedProject$.subscribe(project => {
            if (project) {
                this.selectedProjectId = project.id;
                this.loadMembers(project.id);
            }
        });

        // Subscribe to search term changes
        this.searchSubscription = this.searchService.searchTerm$.subscribe(term => {
            this.filterMembers(term);
        });
    }

    ngOnDestroy(): void {
        this.searchSubscription.unsubscribe(); // Unsubscribe to prevent memory leaks
        this.projectStateSub.unsubscribe(); // Unsubscribe from project state
    }

    loadMembers(projectId: number) {
        this.loading = true;
        this.memberService.getProjectMembers(projectId).subscribe({
            next: (data) => {
                this.allMembers = data;
                this.filteredMembers = data; // Initialize filtered members with all members
                this.loading = false;
                this.filterMembers(this.searchService.getSearchTerm()); // Apply current search term
            },
            error: (err) => {
                /* Handle error */ // Consider a notification service
                this.loading = false;
            }
        });
    }

    filterMembers(searchTerm: string): void {
        if (!searchTerm) {
            this.filteredMembers = this.allMembers; // If no search term, show all members
            return;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        this.filteredMembers = this.allMembers.filter(member =>
            member.userName.toLowerCase().includes(lowerCaseSearchTerm) ||
            member.userEmail.toLowerCase().includes(lowerCaseSearchTerm) ||
            member.roleInProject.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }

    inviteMember() {
        if (!this.isFounder) {
            // console.warn('Only founders can invite members'); // Consider a notification service
            return;
        }

        const projectId = this.selectedProjectId || this.projectState.getCurrentProject()?.id;
        if (!projectId) {
            /* Handle error */ // Consider a notification service
            return;
        }

        this.dialogService.open({
            component: InviteMemberDialogComponent,
            title: 'Invite Member',
            componentData: {
                message: 'Enter the email address of the member you want to invite:',
                confirmText: 'Invite',
                cancelText: 'Cancel'
            }
        }).afterClosed.subscribe(email => {
            if (email) {
                this.invitationService.sendInvitationByEmail(projectId, email).subscribe({
                    next: (inv) => {
                        // console.log('Invitation sent', inv); // Consider a notification service
                        this.loadMembers(projectId);
                        /* Handle success */ // Consider a notification service
                    },
                    error: (err) => {
                        /* Handle error */ // Consider a notification service
                        this.loading = false;
                    }
                });
            }
        });
    }

    removeMember(userId?: number) {
        if (!this.isFounder || !this.selectedProjectId || !userId) return;

        this.dialogService.open({
            title: 'Remove Member',
            message: 'Are you sure you want to remove this member from the project?',
            confirmText: 'Remove',
            cancelText: 'Cancel'
        }).afterClosed.subscribe(result => {
            if (result) {
                this.memberService.removeMember(this.selectedProjectId!, userId).subscribe({
                    next: () => this.loadMembers(this.selectedProjectId!),
                    error: (err) => {
                        /* Handle error */ // Consider a notification service
                    }
                });
            }
        });
    }
}
