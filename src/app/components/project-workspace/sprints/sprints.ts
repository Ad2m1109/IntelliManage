import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStateService } from '../../../services/project-state.service';
import { SprintService, Sprint } from '../../../services/sprint.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { SprintFormComponent } from './sprint-form/sprint-form.component';
import { SearchService } from '../../../services/search.service'; // Import SearchService
import { Subscription } from 'rxjs'; // Import Subscription

@Component({
    selector: 'app-project-sprints',
    standalone: true,
    imports: [CommonModule, SprintFormComponent],
    templateUrl: './sprints.html',
    styleUrl: './sprints.css'
})
export class ProjectSprintsComponent implements OnInit, OnDestroy { // Implement OnDestroy
    allSprints: Sprint[] = []; // Store all sprints
    filteredSprints: Sprint[] = []; // Store filtered sprints
    loading = false;
    isFounder = false;
    selectedProjectId?: number;

    showSprintForm = false;
    sprintToEdit: Sprint | null = null;
    private searchSubscription: Subscription = new Subscription(); // To manage subscription

    constructor(
        private projectState: ProjectStateService,
        private sprintService: SprintService,
        private authService: AuthService,
        private router: Router,
        private searchService: SearchService // Inject SearchService
    ) { }

    ngOnInit() {
        this.isFounder = this.authService.isFounder();
        this.projectState.selectedProject$.subscribe(project => {
            if (project) {
                this.selectedProjectId = project.id;
                this.loadSprints(project.id);
            }
        });

        // Subscribe to search term changes
        this.searchSubscription = this.searchService.searchTerm$.subscribe(term => {
            this.filterSprints(term);
        });
    }

    ngOnDestroy(): void {
        this.searchSubscription.unsubscribe(); // Unsubscribe to prevent memory leaks
    }

    loadSprints(projectId: number) {
        this.loading = true;
        this.sprintService.getProjectSprints(projectId).subscribe({
            next: (data) => {
                this.allSprints = data;
                this.filteredSprints = data; // Initialize filtered sprints with all sprints
                this.loading = false;
                this.filterSprints(this.searchService.getSearchTerm()); // Apply current search term
            },
            error: (err) => {
                console.error('Error loading sprints', err);
                this.loading = false;
            }
        });
    }

    filterSprints(searchTerm: string): void {
        if (!searchTerm) {
            this.filteredSprints = this.allSprints; // If no search term, show all sprints
            return;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        this.filteredSprints = this.allSprints.filter(sprint =>
            sprint.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            (sprint.goal && sprint.goal.toLowerCase().includes(lowerCaseSearchTerm))
            // Add more fields to search if needed
        );
    }

    createSprint() {
        if (!this.isFounder) return;
        this.sprintToEdit = null;
        this.showSprintForm = true;
    }

    editSprint(sprint: Sprint) {
        if (!this.isFounder) return;
        this.sprintToEdit = { ...sprint };
        this.showSprintForm = true;
    }

    handleSprintSubmitted(sprintData: Partial<Sprint>) {
        if (!this.selectedProjectId) return;

        const serviceCall = sprintData.id
            ? this.sprintService.updateSprint(sprintData.id, sprintData)
            : this.sprintService.createSprint(this.selectedProjectId, sprintData);

        serviceCall.subscribe({
            next: () => {
                this.showSprintForm = false;
                this.sprintToEdit = null;
                this.loadSprints(this.selectedProjectId!);
            },
            error: (err) => console.error('Error submitting sprint', err)
        });
    }

    handleCancel() {
        this.showSprintForm = false;
        this.sprintToEdit = null;
    }

    deleteSprint(sprint: Sprint) {
        if (!this.isFounder) return;
        const ok = window.confirm('Delete sprint?');
        if (!ok) return;
        this.sprintService.deleteSprint(sprint.id).subscribe({
            next: () => this.loadSprints(this.selectedProjectId!),
            error: (err) => console.error('Error deleting sprint', err)
        });
    }

    viewSprintTasks(sprintId: number) {
        const userRole = this.authService.isFounder() ? 'founder' : 'employee';
        this.router.navigate([`/${userRole}/projects/${this.selectedProjectId}/sprints/${sprintId}`]);
    }

    goToBacklog() {
        const userRole = this.authService.isFounder() ? 'founder' : 'employee';
        this.router.navigate([`/${userRole}/projects/${this.selectedProjectId}/sprints/backlog`]);
    }
}
