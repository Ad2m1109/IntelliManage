import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { ProjectStateService } from '../../services/project-state.service';
import { Project } from '../../models/project.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-project-workspace',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './project-workspace.html',
    styleUrl: './project-workspace.css'
})
export class ProjectWorkspaceComponent implements OnInit, OnDestroy {
    project: Project | null = null;
    loading = true;
    error = '';
    private routeSub: Subscription | null = null;

    constructor(
        private route: ActivatedRoute,
        private projectService: ProjectService,
        private projectState: ProjectStateService
    ) { }

    ngOnInit() {
        this.routeSub = this.route.paramMap.subscribe(params => {
            const projectId = Number(params.get('projectId'));
            if (projectId) {
                this.loadProject(projectId);
            }
        });
    }

    loadProject(id: number) {
        this.loading = true;
        this.projectService.getProject(id).subscribe({
            next: (project) => {
                this.project = project;
                this.projectState.setSelectedProject(project);
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading project', err);
                this.error = 'Failed to load project';
                this.loading = false;
            }
        });
    }

    ngOnDestroy() {
        this.projectState.clearSelectedProject();
        if (this.routeSub) {
            this.routeSub.unsubscribe();
        }
    }
}
