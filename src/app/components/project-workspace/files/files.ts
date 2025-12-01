import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStateService } from '../../../services/project-state.service';
import { FileService, ProjectFile } from '../../../services/file.service';

@Component({
    selector: 'app-project-files',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './files.html',
    styleUrl: './files.css'
})
export class ProjectFilesComponent implements OnInit {
    files: ProjectFile[] = [];
    loading = false;

    constructor(
        private projectState: ProjectStateService,
        private fileService: FileService
    ) { }

    ngOnInit() {
        this.projectState.selectedProject$.subscribe(project => {
            if (project) {
                this.loadFiles(project.id);
            }
        });
    }

    loadFiles(projectId: number) {
        this.loading = true;
        this.fileService.getProjectFiles(projectId).subscribe({
            next: (data) => {
                this.files = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading files', err);
                this.loading = false;
            }
        });
    }
}
