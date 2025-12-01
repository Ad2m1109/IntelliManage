import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStateService } from '../../../services/project-state.service';
import { Project } from '../../../models/project.model';

@Component({
    selector: 'app-project-overview',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './overview.html',
    styleUrl: './overview.css'
})
export class ProjectOverviewComponent implements OnInit {
    project: Project | null = null;

    constructor(private projectState: ProjectStateService) { }

    ngOnInit() {
        this.projectState.selectedProject$.subscribe(project => {
            this.project = project;
        });
    }
}
