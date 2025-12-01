import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStateService } from '../../../services/project-state.service';
import { SprintService, Sprint } from '../../../services/sprint.service';

@Component({
    selector: 'app-project-sprints',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './sprints.html',
    styleUrl: './sprints.css'
})
export class ProjectSprintsComponent implements OnInit {
    sprints: Sprint[] = [];
    loading = false;

    constructor(
        private projectState: ProjectStateService,
        private sprintService: SprintService
    ) { }

    ngOnInit() {
        this.projectState.selectedProject$.subscribe(project => {
            if (project) {
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
}
