import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStateService } from '../../../services/project-state.service';
import { SprintService, Sprint } from '../../../services/sprint.service';
import { AuthService } from '../../../services/auth.service';
import { HasRoleDirective } from '../../../directives/has-role.directive';
import { Router } from '@angular/router';

@Component({
    selector: 'app-project-sprints',
    standalone: true,
    imports: [CommonModule, HasRoleDirective],
    templateUrl: './sprints.html',
    styleUrl: './sprints.css'
})
export class ProjectSprintsComponent implements OnInit {
    sprints: Sprint[] = [];
    loading = false;
    isFounder = false;
    selectedProjectId?: number;

    constructor(
        private projectState: ProjectStateService,
        private sprintService: SprintService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit() {
        this.isFounder = this.authService.isFounder();
        this.projectState.selectedProject$.subscribe(project => {
            if (project) {
                this.selectedProjectId = project.id;
                this.loadSprints(project.id);
            }
        });
    }

    loadSprints(projectId: number) {
        this.loading = true;
        this.sprintService.getProjectSprints(projectId).subscribe({
            next: (data) => {
                this.sprints = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading sprints', err);
                this.loading = false;
            }
        });
    }

    createSprint() {
        if (!this.isFounder || !this.selectedProjectId) return;
        const name = window.prompt('Sprint name');
        if (!name) return;
        const goal = window.prompt('Sprint goal') || '';
        const sprint: Partial<Sprint> = { name, goal, status: 'PLANNED' } as any;
        this.sprintService.createSprint(this.selectedProjectId, sprint).subscribe({
            next: () => this.loadSprints(this.selectedProjectId!),
            error: (err) => console.error('Error creating sprint', err)
        });
    }

    startSprint(sprint: Sprint) {
        if (!this.isFounder) return;
        this.sprintService.updateSprint(sprint.id, { status: 'ACTIVE' } as any).subscribe({
            next: () => this.loadSprints(this.selectedProjectId!),
            error: (err) => console.error('Error starting sprint', err)
        });
    }

    endSprint(sprint: Sprint) {
        if (!this.isFounder) return;
        this.sprintService.updateSprint(sprint.id, { status: 'COMPLETED' } as any).subscribe({
            next: () => this.loadSprints(this.selectedProjectId!),
            error: (err) => console.error('Error ending sprint', err)
        });
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
