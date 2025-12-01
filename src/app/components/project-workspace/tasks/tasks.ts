import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStateService } from '../../../services/project-state.service';
import { TaskService } from '../../../services/task.service';
import { Task } from '../../../models/task.model';

@Component({
    selector: 'app-project-tasks',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './tasks.html',
    styleUrl: './tasks.css'
})
export class ProjectTasksComponent implements OnInit {
    tasks: Task[] = [];
    loading = false;

    constructor(
        private projectState: ProjectStateService,
        private taskService: TaskService
    ) { }

    ngOnInit() {
        this.projectState.selectedProject$.subscribe(project => {
            if (project) {
                this.loadTasks(project.id);
            }
        });
    }

    loadTasks(projectId: number) {
        this.loading = true;
        this.taskService.getProjectTasks(projectId).subscribe({
            next: (data) => {
                this.tasks = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading tasks', err);
                this.loading = false;
            }
        });
    }
}
