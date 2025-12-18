import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStateService } from '../../../services/project-state.service';
import { MemberService } from '../../../services/member.service';
import { ProjectMember } from '../../../models/project-member.model';
import { InvitationService } from '../../../services/invitation.service';
import { AuthService } from '../../../services/auth.service';
import { SearchService } from '../../../services/search.service'; // Import SearchService
import { Subscription } from 'rxjs'; // Import Subscription

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
    private searchSubscription: Subscription = new Subscription(); // To manage subscription

    constructor(
        private projectState: ProjectStateService,
        private memberService: MemberService,
        private invitationService: InvitationService,
        private authService: AuthService,
        private searchService: SearchService // Inject SearchService
    ) { }

    ngOnInit() {
        this.isFounder = this.authService.isFounder();
        this.projectState.selectedProject$.subscribe(project => {
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
                console.error('Error loading members', err);
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
            // Add more fields to search if needed
        );
    }

    inviteMember() {
        if (!this.isFounder) {
            console.warn('Only founders can invite members');
            return;
        }

        // Ensure we have the project id; fall back to the ProjectStateService if needed
        const projectId = this.selectedProjectId || this.projectState.getCurrentProject()?.id;
        if (!projectId) {
            console.error('No project selected - cannot invite member');
            window.alert('No project selected. Open a project workspace first.');
            return;
        }

        const email = window.prompt('Invite member by email');
        if (!email) return;

        this.invitationService.sendInvitationByEmail(projectId, email).subscribe({
            next: (inv) => {
                console.log('Invitation sent', inv);
                this.loadMembers(projectId);
                window.alert('Invitation sent');
            },
            error: (err) => {
                console.error('Error sending invitation', err);
                window.alert('Failed to send invitation');
            }
        });
    }

    removeMember(userId?: number) {
        if (!this.isFounder || !this.selectedProjectId || !userId) return;
        const ok = window.confirm('Remove this member?');
        if (!ok) return;
        this.memberService.removeMember(this.selectedProjectId, userId).subscribe({
            next: () => this.loadMembers(this.selectedProjectId!),
            error: (err) => console.error('Error removing member', err)
        });
    }
}
